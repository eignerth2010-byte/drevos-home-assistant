"""Exercise panel ownership, offline startup, multi-oven isolation and teardown."""

import importlib.util
import json
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace
from unittest.mock import AsyncMock

import pytest

DIRECTORY = Path(__file__).parents[1] / "custom_components" / "drevos"


@pytest.fixture
def environment(monkeypatch):
    def module(name, **values):
        result = ModuleType(name)
        result.__dict__.update(values)
        monkeypatch.setitem(sys.modules, name, result)
        return result

    registrations, removals = [], []
    def register(hass, **values):
        panels = hass.data.setdefault("frontend_panels", {})
        path = values["frontend_url_path"]
        if path in panels and not values.get("update"):
            raise ValueError("Panel collision")
        panels[path] = SimpleNamespace(**values)
        registrations.append(values)

    def remove(hass, path):
        hass.data["frontend_panels"].pop(path)
        removals.append(path)

    frontend = module("homeassistant.components.frontend", DATA_PANELS="frontend_panels",
                      async_register_built_in_panel=register, async_remove_panel=remove)
    module("homeassistant")
    module("homeassistant.components", frontend=frontend)
    module("homeassistant.components.http", StaticPathConfig=lambda *args: args)
    module("homeassistant.components.lovelace", LOVELACE_DATA="lovelace")
    module("homeassistant.core", callback=lambda fn: fn)
    module("homeassistant.const", Platform=SimpleNamespace(
        SENSOR="sensor", NUMBER="number", SWITCH="switch", BUTTON="button",
        BINARY_SENSOR="binary_sensor"))
    module("homeassistant.helpers")
    module("homeassistant.helpers.aiohttp_client", async_get_clientsession=lambda hass: None)
    class NotReady(Exception):
        pass
    module("homeassistant.exceptions", ConfigEntryNotReady=NotReady,
           ConfigEntryAuthFailed=type("AuthFailed", (Exception,), {}))
    class GatewayError(Exception):
        pass
    class GatewayAuthError(GatewayError):
        pass
    client = SimpleNamespace(info=AsyncMock(side_effect=GatewayError("offline")))
    package_name = "_drevos_frontend_test"
    package = module(package_name)
    package.__path__ = [str(DIRECTORY)]
    module(package_name + ".api", DrevosClient=lambda *args: client,
           DrevosError=GatewayError, DrevosAuthError=GatewayAuthError)
    module(package_name + ".coordinator", DrevosCoordinator=object)
    # Load the actual integration entry points and frontend module, not a copied model.
    spec = importlib.util.spec_from_file_location(package_name, DIRECTORY / "__init__.py",
                                                submodule_search_locations=[str(DIRECTORY)])
    integration = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, package_name, integration)
    for suffix in ("const", "frontend"):
        monkeypatch.setitem(sys.modules, package_name + "." + suffix, None)
        monkeypatch.delitem(sys.modules, package_name + "." + suffix)
    spec.loader.exec_module(integration)
    panel = sys.modules[package_name + ".frontend"]
    resources = SimpleNamespace(async_get_info=AsyncMock(), async_items=lambda: [],
                                async_create_item=AsyncMock(), async_update_item=AsyncMock())
    hass = SimpleNamespace(
        data={"lovelace": SimpleNamespace(resource_mode="storage", resources=resources)},
        http=SimpleNamespace(async_register_static_paths=AsyncMock()),
        config_entries=SimpleNamespace(async_entries=lambda domain: [],
                                       async_unload_platforms=AsyncMock(return_value=True)),
    )
    def entry(identity="a", title="Test oven"):
        return SimpleNamespace(entry_id="entry_" + identity, unique_id="gateway_" + identity,
                               title=title, disabled_by=None,
                               data={"url": "http://fixture.invalid", "token": "test_only_secret"})
    return SimpleNamespace(hass=hass, panel=panel, integration=integration, entry=entry,
                           registrations=registrations, removals=removals, resources=resources,
                           client=client, NotReady=NotReady)


@pytest.mark.asyncio
async def test_local_modules_and_existing_card_resource_registered_once(environment):
    e = environment
    e.resources.async_items = lambda: [{"id": "old", "url": "/drevos_static/drevos-smoker-card.js?v=0.1.4"}]
    await e.panel.async_setup_frontend(e.hass)
    await e.panel.async_setup_frontend(e.hass)
    e.hass.http.async_register_static_paths.assert_awaited_once()
    paths = e.hass.http.async_register_static_paths.call_args.args[0]
    assert {p[0] for p in paths} == {
        "/drevos_static/drevos-smoker-card.js", "/drevos_static/drevos-smoker-panel.js"}
    assert all(Path(p[1]).is_file() for p in paths)
    e.resources.async_create_item.assert_not_awaited()
    e.resources.async_update_item.assert_awaited_once_with("old", {
        "res_type": "module", "url": "/drevos_static/drevos-smoker-card.js?v=0.1.5"})


@pytest.mark.asyncio
async def test_resource_failure_retries_without_duplicate_http_routes(environment):
    e = environment
    e.resources.async_get_info.side_effect = [RuntimeError("not ready"), None]
    with pytest.raises(RuntimeError):
        await e.panel.async_setup_frontend(e.hass)
    await e.panel.async_setup_frontend(e.hass)
    e.hass.http.async_register_static_paths.assert_awaited_once()
    e.resources.async_create_item.assert_awaited_once()


@pytest.mark.asyncio
async def test_yaml_resources_are_not_modified(environment):
    e = environment
    e.hass.data["lovelace"].resource_mode = "yaml"
    await e.panel.async_setup_frontend(e.hass)
    e.resources.async_get_info.assert_not_awaited()
    e.resources.async_create_item.assert_not_awaited()


@pytest.mark.asyncio
async def test_sidebar_is_available_before_gateway_connection_and_on_retry(environment):
    e = environment
    entry = e.entry()
    e.hass.config_entries.async_entries = lambda domain: [entry]
    await e.integration.async_setup(e.hass, {})
    with pytest.raises(e.NotReady):
        await e.integration.async_setup_entry(e.hass, entry)
    with pytest.raises(e.NotReady):
        await e.integration.async_setup_entry(e.hass, entry)
    assert len(e.registrations) == 1
    assert e.registrations[0]["sidebar_title"] == "Drevos"
    assert e.registrations[0]["config"]["gateways"] == [{"id": "gateway_a", "name": "Test oven"}]
    assert "test_only_secret" not in json.dumps(e.registrations)
    assert "fixture.invalid" not in json.dumps(e.registrations)


def test_one_panel_keeps_ovens_separate_and_removes_only_the_last(environment):
    e = environment
    first, second = e.entry("a"), e.entry("b")
    e.panel.async_add_entry(e.hass, first)
    e.panel.async_add_entry(e.hass, second)
    assert len(e.hass.data["frontend_panels"]) == 1
    assert [g["id"] for g in e.registrations[-1]["config"]["gateways"]] == ["gateway_a", "gateway_b"]
    e.panel.async_remove_entry(e.hass, first)
    assert e.registrations[-1]["config"]["gateways"][0]["id"] == "gateway_b"
    assert not e.removals
    e.panel.async_remove_entry(e.hass, second)
    e.panel.async_remove_entry(e.hass, second)
    assert e.removals == ["drevos"]
    assert not e.hass.data["frontend_panels"]


def test_foreign_panel_is_never_overwritten_or_removed(environment):
    e = environment
    foreign = SimpleNamespace(config={"owner": "another integration"})
    e.hass.data["frontend_panels"] = {"drevos": foreign}
    entry = e.entry()
    e.panel.async_add_entry(e.hass, entry)
    e.panel.async_remove_entry(e.hass, entry)
    assert e.hass.data["frontend_panels"]["drevos"] is foreign
    assert not e.registrations and not e.removals


@pytest.mark.asyncio
async def test_unload_failure_retains_panel_and_removal_of_offline_entry_cleans_up(environment):
    e = environment
    entry = e.entry()
    e.panel.async_add_entry(e.hass, entry)
    e.hass.config_entries.async_unload_platforms.return_value = False
    assert not await e.integration.async_unload_entry(e.hass, entry)
    assert not e.removals
    await e.integration.async_remove_entry(e.hass, entry)
    assert e.removals == ["drevos"]


@pytest.mark.asyncio
async def test_successful_unload_removes_panel_and_reload_recreates_it(environment):
    e = environment
    entry = e.entry()
    e.panel.async_add_entry(e.hass, entry)
    assert await e.integration.async_unload_entry(e.hass, entry)
    e.panel.async_add_entry(e.hass, entry)
    assert len(e.hass.data["frontend_panels"]) == 1
    assert e.registrations[-1]["update"] is False


@pytest.mark.asyncio
async def test_disabled_entries_are_not_added_at_startup(environment):
    e = environment
    disabled = e.entry()
    disabled.disabled_by = "user"
    e.hass.config_entries.async_entries = lambda domain: [disabled]
    await e.integration.async_setup(e.hass, {})
    assert not e.registrations
