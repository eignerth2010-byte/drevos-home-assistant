"""Test the real asynchronous client independently of HA imports."""
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
