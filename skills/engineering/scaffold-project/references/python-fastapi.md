# Python FastAPI

Follow FastAPI's official uv-based project setup. Official source: <https://fastapi.tiangolo.com/virtual-environments/>.

## Prerequisite

Require `uv`. If it is unavailable, stop and report that requirement; do not install it globally.

## Create

Run from the target parent, or use `.` inside an existing empty target:

```text
uv init <project-name> --bare
uv add "fastapi[standard]"
```

Create `main.py` with the official minimal application shape:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello World"}
```

Add the application entry point to the existing `[tool.fastapi]` table in `pyproject.toml`, or create the table if absent:

```toml
[tool.fastapi]
entrypoint = "main:app"
```

The `--bare` form does not initialize Git. Do not add a database, authentication, deployment files, or unrelated dependencies.

## Configure tests

Run `uv add --dev pytest`, then check whether the resolved FastAPI standard dependencies provide `httpx` with `uv run python -c "import httpx"`. Only if that command fails because `httpx` is missing, run `uv add --dev httpx`.

Create `tests/test_main.py` using FastAPI `TestClient`; assert the root endpoint status and JSON response.

Add this configuration to `pyproject.toml` so pytest can import the bare root-level application consistently:

```toml
[tool.pytest.ini_options]
pythonpath = ["."]
```

## Verify

Run inside the generated project:

```text
uv sync
uv run pytest
uv run python -c "from main import app; assert app is not None"
uv run python -X utf8 -m fastapi --help
```

Confirm that `pyproject.toml`, `uv.lock`, `main.py`, and `tests/test_main.py` exist. Report `uv run fastapi dev` as the next development command. Do not start a long-running development server during verification.
