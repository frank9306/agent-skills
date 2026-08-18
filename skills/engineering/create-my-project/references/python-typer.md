# Python Typer CLI

Follow the official Typer packaging guide using uv. Official sources: <https://typer.tiangolo.com/tutorial/package/> and <https://docs.astral.sh/uv/concepts/projects/init/>.

## Prerequisite

Require `uv`. If it is unavailable, stop and report that requirement; do not install it globally.

## Normalize names

- Keep the distribution and command name in lowercase kebab-case.
- Convert the import package name to lowercase snake_case.
- Reject a name that cannot produce a valid Python package identifier.

## Create

Run from the target parent, or use `.` inside an existing empty target:

```text
uv init --package <project-name> --vcs none
uv add typer
```

Create `src/<package_name>/main.py` with a minimal Typer application:

```python
import typer

app = typer.Typer()


@app.command()
def hello(name: str = "World") -> None:
    """Print a greeting."""
    typer.echo(f"Hello {name}")
```

Ensure `pyproject.toml` contains this entry point without changing the versions resolved by uv:

```toml
[project.scripts]
<project-name> = "<package_name>.main:app"
```

Current uv versions may create `[project.scripts]` automatically. Update the generated command value when the table or key already exists; never append a duplicate TOML table or key.

Do not add Rich explicitly, Ruff, Pyright, PyInstaller, or unrelated dependencies.

## Configure tests

Run `uv add --dev pytest`. Create `tests/test_cli.py`, import the generated Typer `app`, invoke it with `typer.testing.CliRunner` using `--name Alice`, and assert the exit code and visible greeting. Keep the test independent of private implementation details.

## Verify

Run inside the generated project:

```text
uv sync
uv run pytest
uv run <project-name> --help
uv build
```

Confirm that `pyproject.toml`, `uv.lock`, the package directory, `tests/test_cli.py`, and the installed command exist. Report `uv run <project-name> --help` as the next command.
