"""Test the real asynchronous client independently of HA imports."""
import asyncio
import importlib.util
from pathlib import Path
import pytest
import pytest_asyncio
from aiohttp import ClientSession, web

spec=importlib.util.spec_from_file_location("drevos_api",Path(__file__).parents[1]/"custom_components/drevos/api.py")
api=importlib.util.module_from_spec(spec);spec.loader.exec_module(api)


@pytest_asyncio.fixture
async def endpoint():
    seen=[]
    async def handle(request):
        seen.append((request.method,request.path,request.headers.get("Authorization")))
        if request.path.endswith("info"):
            return web.json_response({"api_version":1,"profile":"drevos_fx3u_v1","id":"synthetic_gateway"})
        if request.path.endswith("state"):
            return web.json_response({"available":False})
        if request.path.endswith("command"):
            return web.json_response({"error":"uncertain"},status=503)
        if request.path.endswith("redirect"):
            raise web.HTTPFound("/api/v1/info")
        return web.json_response({},status=401)
    app=web.Application();app.router.add_route("*","/{path:.*}",handle)
    runner=web.AppRunner(app);await runner.setup()
    site=web.TCPSite(runner,"127.0.0.1",0);await site.start()
    url=f"http://127.0.0.1:{site._server.sockets[0].getsockname()[1]}"
    async with ClientSession() as session:
        yield api.DrevosClient(session,url,"test_only_secret"),seen
    await runner.cleanup()


def test_url_rejects_credentials_query_and_unexpected_path():
    for value in ["file:///etc/passwd","http://user:pass@host","http://host?token=x","http://host/api"]:
        with pytest.raises(ValueError):api.validate_url(value)
    assert api.validate_url("https://gateway.example/")=="https://gateway.example"


@pytest.mark.asyncio
async def test_info_and_offline_state(endpoint):
    client,seen=endpoint
    assert (await client.info())["api_version"]==1
    assert await client.state()=={"available":False}
    assert len(seen)==2
    assert all(record[2]=="Bearer test_only_secret" for record in seen)


@pytest.mark.asyncio
async def test_command_is_not_retried_or_leaked(endpoint):
    client,seen=endpoint
    with pytest.raises(api.DrevosError) as error:await client.command("luefter","ON")
    assert len(seen)==1
    assert "test_only_secret" not in str(error.value)
    assert client.url not in str(error.value)


@pytest.mark.asyncio
async def test_authentication_and_redirect_handling(endpoint):
    client,seen=endpoint
    with pytest.raises(api.DrevosAuthError):await client.request("GET","auth")
    with pytest.raises(api.DrevosError):await client.request("GET","redirect")
    assert len(seen)==2 # Redirect was not followed with a bearer token.


@pytest_asyncio.fixture
async def delayed_endpoint():
    started, release = asyncio.Event(), asyncio.Event()
    commands = []
    response_status = [200]

    async def handle(request):
        if request.method == "GET":
            return web.json_response({"available": False})
        commands.append(await request.json())
        started.set()
        await release.wait()
        return web.json_response(
            {"available": True} if response_status[0] == 200 else
            {"error": "untrusted test_only_secret response"}, status=response_status[0]
        )

    app = web.Application()
    app.router.add_route("*", "/{path:.*}", handle)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", 0)
    await site.start()
    url = f"http://127.0.0.1:{site._server.sockets[0].getsockname()[1]}"
    async with ClientSession() as session:
        try:
            yield api.DrevosClient(session, url, "test_only_secret"), started, release, commands, response_status
        finally:
            release.set()
    await runner.cleanup()


@pytest.mark.asyncio
@pytest.mark.parametrize("status", [200, 409, 503])
async def test_overlapping_commands_are_rejected_not_queued_and_guard_recovers(delayed_endpoint, status):
    client, started, release, commands, response_status = delayed_endpoint
    response_status[0] = status
    first = asyncio.create_task(client.command("luefter", "ON"))
    await asyncio.wait_for(started.wait(), 2)
    try:
        with pytest.raises(api.DrevosBusyError):
            await asyncio.wait_for(client.command("konvektion", "ON"), 1)
        # Ordinary reads remain possible while the first write is in flight.
        assert await client.state() == {"available": False}
        assert commands == [{"name": "luefter", "value": "ON"}]
    finally:
        release.set()
    if status == 200:
        assert await first == {"available": True}
    else:
        error_type = api.DrevosRejectedError if status == 409 else api.DrevosError
        with pytest.raises(error_type) as error:
            await first
        assert "test_only_secret" not in str(error.value)
    assert len(commands) == 1  # The refused command did not run after the first completed.
    response_status[0] = 200
    assert await client.command("luefter", "OFF") == {"available": True}
    assert commands == [{"name": "luefter", "value": "ON"}, {"name": "luefter", "value": "OFF"}]


@pytest.mark.asyncio
async def test_cancelled_command_is_not_retried_and_does_not_leave_client_locked(delayed_endpoint):
    client, started, release, commands, _ = delayed_endpoint
    first = asyncio.create_task(client.command("luefter", "ON"))
    await asyncio.wait_for(started.wait(), 2)
    first.cancel()
    with pytest.raises(asyncio.CancelledError):
        await first
    release.set()
    assert len(commands) == 1
    assert await client.command("luefter", "OFF") == {"available": True}
    assert len(commands) == 2
