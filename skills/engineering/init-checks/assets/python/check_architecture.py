#!/usr/bin/env python3
"""Project-owned structural checks. Dependency analysis is Import Linter / Grimp's.

Requires import-linter==2.15; no Node runtime, source imports, or code rewriting.
"""
import argparse
import ast
from contextlib import redirect_stdout
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import sys
import tokenize


class ConfigurationError(Exception):
    """An incomplete contract must never produce PASS."""


def relative(value, allow_root=False):
    if not isinstance(value, str) or not value or "\\" in value:
        raise ConfigurationError(f"Expected a relative POSIX path: {value!r}")
    path = PurePosixPath(value)
    if path.is_absolute() or ":" in value or ".." in path.parts or any(c in value for c in "*?[]{}") or path.as_posix() != value or (value == "." and not allow_root):
        raise ConfigurationError(f"Unsafe or wildcard path: {value!r}")
    return path.as_posix()


def keys(value, allowed, label):
    if not isinstance(value, dict) or set(value) - set(allowed):
        raise ConfigurationError(f"Expected known {label} keys only: {allowed}")


def strings(value, label):
    if not isinstance(value, list) or any(not isinstance(v, str) or not v for v in value) or len(value) != len(set(value)):
        raise ConfigurationError(f"{label} must contain unique nonempty strings.")
    return value


def within(path, parent):
    return path == parent or path.startswith(parent.rstrip("/") + "/") or parent == "."


def check(root):
    from importlib.metadata import version
    try:
        if version("import-linter") != "2.15":
            raise ConfigurationError("Use the tested import-linter==2.15 adapter, or upgrade and verify it explicitly.")
        import grimp
        from importlinter import configuration
        from importlinter.contracts.protected import ProtectedContract
    except ImportError as error:
        raise ConfigurationError("Missing import-linter==2.15 in the selected Python environment.") from error
    configuration.configure()
    contract = json.loads((root / ".architecture.json").read_text(encoding="utf-8"))
    keys(contract, ["schemaVersion", "profile", "sourceRoots", "modules", "externalOwners", "dynamicLoaders", "baseline", "excludedPaths"], "contract")
    if contract.get("schemaVersion") != 1 or contract.get("profile", "python") != "python":
        raise ConfigurationError("Expected schemaVersion: 1 and profile: python.")
    roots = [relative(p, allow_root=True) for p in strings(contract.get("sourceRoots", []), "sourceRoots")]
    modules = contract.get("modules", [])
    if not roots or not modules or any(not (root / p).is_dir() for p in roots):
        raise ConfigurationError("Nonempty sourceRoots and modules must exist.")
    for module in modules:
        keys(module, ["name", "path", "public", "exports", "allow", "testPaths"], "module")
    names = [m["name"] for m in modules]
    if any(not isinstance(n, str) or not re.fullmatch(r"[A-Za-z][\w-]*", n) for n in names) or len(set(names)) != len(names):
        raise ConfigurationError("Module names must be unique nonempty strings.")
    public, exports, owners, tests = set(), {}, {}, set()
    for module in modules:
        module["path"] = relative(module["path"])
        if not (root / module["path"]).exists() or not any(within(module["path"], p) for p in roots):
            raise ConfigurationError(f"Module outside sourceRoots or missing: {module['path']}")
        allowed = strings(module.get("allow", []), "module.allow")
        if not set(allowed).issubset(names) or module["name"] in allowed:
            raise ConfigurationError(f"Unknown allowed module in {module['name']}")
        entries = strings(module.get("public", []), "module.public")
        if not entries or not isinstance(module.get("exports"), dict) or set(module["exports"]) != set(entries):
            raise ConfigurationError(f"Every public entry needs an explicit exports list: {module['name']}")
        for entry in module["public"]:
            entry = relative(entry)
            if not within(entry, module["path"]) or not (root / entry).is_file() or not entry.endswith(".py"):
                raise ConfigurationError(f"Invalid public entry: {entry}")
            values = module["exports"][entry]
            if not isinstance(values, list) or any(not isinstance(n, str) or not n.isidentifier() or n.startswith("_") for n in values) or len(values) != len(set(values)):
                raise ConfigurationError(f"Exports must be unique explicit public names: {entry}")
            public.add(entry)
            exports[entry] = set(values)
        for path in strings(module.get("testPaths", []), "module.testPaths"):
            path = relative(path)
            if not (root / path).is_dir():
                raise ConfigurationError(f"Missing testPath: {path}")
            if any(within(path, p) or within(p, path) for p in tests) or any(within(path, m["path"]) for m in modules):
                raise ConfigurationError("testPaths are non-overlapping external contract tests; internal tests belong to module.path.")
            tests.add(path)
    for left in modules:
        for right in modules:
            if left is not right and within(left["path"], right["path"]):
                raise ConfigurationError("Module paths must not overlap; own parent __init__.py as a file module.")
    excluded = [relative(p) for p in strings(contract.get("excludedPaths", []), "excludedPaths")]
    generated = {"generated", "vendor", "node_modules", "dist", "build", ".venv", "venv", "__pycache__"}
    for path in excluded:
        if not (set(PurePosixPath(path).parts) & generated) and path not in {"scripts/check_architecture.py", "scripts/check_architecture.mjs", "scripts/codex_checks.py", "scripts/codex-checks.py", "scripts/codex-checks.mjs"}:
            raise ConfigurationError(f"Only generated/vendor paths or exact managed scripts may be excluded: {path}")
        if any(within(m["path"], path) or within(path, m["path"]) for m in modules):
            raise ConfigurationError(f"An exclusion cannot hide a declared module: {path}")
    dynamic = {relative(p) for p in strings(contract.get("dynamicLoaders", []), "dynamicLoaders")}
    external = contract.get("externalOwners", {})
    for package, allowed in external.items():
        if not package.isidentifier() or not isinstance(allowed, list) or not set(allowed).issubset(names):
            raise ConfigurationError(f"Invalid external owner: {package}")
    violations = []

    def add(rule, source, target, message):
        value = {"rule": rule, "from": source, "to": target, "message": message}
        if not any((v["rule"], v["from"], v["to"]) == (rule, source, target) for v in violations):
            violations.append(value)

    files = []
    for directory, directories, filenames in os.walk(root):
        directories[:] = sorted(d for d in directories if d not in {".git", ".venv", "venv", "node_modules", "__pycache__", ".tox", ".mypy_cache", ".pytest_cache"} and not any(within((Path(directory) / d).relative_to(root).as_posix(), p) for p in excluded))
        if any((Path(directory) / d).is_symlink() for d in directories):
            raise ConfigurationError(f"An unscanned source symlink requires an explicit generated/vendor exclusion: {directory}")
        for filename in sorted(filenames):
            file = Path(directory) / filename
            path = file.relative_to(root).as_posix()
            if file.suffix == ".py" and not any(within(path, p) for p in excluded):
                if file.is_symlink() or not file.resolve().is_relative_to(root):
                    raise ConfigurationError(f"Source escapes project through a symlink: {path}")
                files.append(path)
    mapped, trees, test_files = {}, {}, set()
    search_dirs = [root / p for p in roots]
    for path in files:
        owner = next((m for m in modules if within(path, m["path"])), None)
        is_test = any(within(path, p) for p in tests)
        if owner:
            owners[path] = owner
        elif not is_test:
            add("unclassified-source", path, path, "Assign this Python source to a module or an external testPath.")
            continue
        if is_test:
            test_files.add(path)
        source_dir = next((root / p for p in roots if within(path, p)), None)
        if source_dir is None:
            test_root = next(p for p in sorted(tests, key=len) if within(path, p))
            source_dir = (root / test_root).parent
            search_dirs.append(source_dir)
        parts = list((root / path).relative_to(source_dir).with_suffix("").parts)
        if parts[-1] == "__init__":
            parts.pop()
        if not parts or any(not part.isidentifier() for part in parts):
            raise ConfigurationError(f"Not an importable package path: {path}")
        name = ".".join(parts)
        if name in mapped:
            raise ConfigurationError(f"Ambiguous Python import name: {name}")
        mapped[name] = path
        with tokenize.open(root / path) as handle:
            trees[path] = ast.parse(handle.read(), filename=path)
    if not dynamic.issubset(owners):
        raise ConfigurationError("Every dynamicLoader must be an owned Python source.")
    if not mapped:
        raise ConfigurationError("No importable Python source was found.")
    package_names = sorted({name.split(".")[0] for name in mapped})
    for name in package_names:
        if name not in mapped or not mapped[name].endswith("/__init__.py"):
            raise ConfigurationError(f"Grimp needs a regular root package: {name}; include and own its __init__.py.")
    sys.path[:0] = list(dict.fromkeys(str(p) for p in search_dirs))
    graph = grimp.build_graph(*package_names, include_external_packages=True,
                              exclude_type_checking_imports=False, cache_dir=None)
    for name, path in mapped.items():
        if name not in graph.modules:
            add("unscanned-source", path, name, "The import engine omitted this source; fix package discovery.")
    # AST complements native resolution only for exports and explicit dynamic imports.
    for name, path in mapped.items():
        tree = trees[path]
        if path in public:
            assignments = [n for n in ast.walk(tree) if isinstance(n, (ast.Assign, ast.AnnAssign)) and any(isinstance(t, ast.Name) and t.id == "__all__" for t in (n.targets if isinstance(n, ast.Assign) else [n.target]))]
            actual = None
            if len(assignments) == 1 and assignments[0] in tree.body:
                try:
                    value = ast.literal_eval(assignments[0].value)
                    if isinstance(value, (list, tuple)) and all(isinstance(v, str) for v in value) and len(value) == len(set(value)):
                        actual = set(value)
                except (ValueError, TypeError):
                    pass
            bound = set()
            for node in tree.body:
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    bound.add(node.name)
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    bound.update(a.asname or (a.name.split(".")[0] if isinstance(node, ast.Import) else a.name) for a in node.names)
                elif isinstance(node, (ast.Assign, ast.AnnAssign)):
                    targets = node.targets if isinstance(node, ast.Assign) else [node.target]
                    bound.update(t.id for target in targets for t in ast.walk(target) if isinstance(t, ast.Name))
            visible = {n for n in bound if not n.startswith("_")}
            allowed_all = [t for a in assignments for t in (a.targets if isinstance(a, ast.Assign) else [a.target])]
            if actual != exports[path] or visible != exports[path] or any(isinstance(n, ast.Name) and n.id == "__all__" and n not in allowed_all for n in ast.walk(tree)):
                add("undeclared-export", path, path, "Use one literal __all__ matching the declared exports and public bindings; prefix helpers with underscore.")
            if any(isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == "__getattr__" for n in ast.walk(tree)):
                add("undeclared-export", path, path, "Dynamic public __getattr__ is not a statically declared interface.")
        aliases = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    local = alias.asname or alias.name.split(".")[0]
                    aliases[local] = alias.name if alias.asname else alias.name.split(".")[0]
            elif isinstance(node, ast.ImportFrom) and node.module:
                for alias in node.names:
                    aliases[alias.asname or alias.name] = f"{node.module}.{alias.name}"

        def qualified(node):
            if isinstance(node, ast.Name):
                return aliases.get(node.id, node.id)
            if isinstance(node, ast.Attribute):
                return qualified(node.value) + "." + node.attr
            if isinstance(node, ast.Call) and qualified(node.func) in {"getattr", "builtins.getattr"} and len(node.args) >= 2 and isinstance(node.args[1], ast.Constant) and isinstance(node.args[1].value, str):
                return qualified(node.args[0]) + "." + node.args[1].value
            return ""

        # Follow ordinary loader aliases, so renaming import_module does not bypass the guard.
        for _ in range(len(tree.body)):
            changed = False
            for node in ast.walk(tree):
                if isinstance(node, (ast.Assign, ast.AnnAssign)):
                    targets = node.targets if isinstance(node, ast.Assign) else [node.target]
                    value = qualified(node.value)
                    if value:
                        for target in targets:
                            if isinstance(target, ast.Name) and aliases.get(target.id) != value:
                                aliases[target.id] = value
                                changed = True
            if not changed:
                break

        def public_symbol(target, symbol):
            target_path = mapped.get(target)
            if target_path in public and (path in test_files or owners.get(path) is not owners.get(target_path)) and symbol not in exports[target_path]:
                add("undeclared-export", path, target_path, f"{symbol} is not a declared export of {target}.")

        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                if isinstance(node, ast.ImportFrom):
                    if any(a.name == "*" for a in node.names):
                        add("wildcard-export", path, node.module or ".", "Use explicit named imports and re-exports.")
                    package = name if path.endswith("/__init__.py") else name.rpartition(".")[0]
                    base = node.module or ""
                    if node.level:
                        import importlib.util
                        try:
                            base = importlib.util.resolve_name("." * node.level + base, package)
                        except (ImportError, ValueError) as error:
                            raise ConfigurationError(f"Invalid relative import in {path}: {error}") from error
                    targets = [base]
                    for alias in node.names:
                        candidate = base + "." + alias.name
                        if candidate in mapped:
                            targets.append(candidate)
                        elif alias.name != "*":
                            public_symbol(base, alias.name)
                else:
                    targets = [a.name for a in node.names]
                for target in targets:
                    if target.split(".")[0] in package_names and target not in mapped:
                        add("unresolved-import", path, target, "Internal import does not resolve to scanned source.")
            elif isinstance(node, ast.Attribute):
                public_symbol(qualified(node.value), node.attr)
            elif isinstance(node, ast.Call):
                function = qualified(node.func)
                loading = function in {"importlib.import_module", "builtins.__import__", "__import__"}
                opaque = function in {"exec", "eval", "compile", "builtins.exec", "builtins.eval", "builtins.compile"}
                if function in {"getattr", "builtins.getattr"} and len(node.args) >= 2:
                    module_name = qualified(node.args[0])
                    attribute = node.args[1]
                    if module_name in mapped or module_name in {"importlib", "builtins"}:
                        if isinstance(attribute, ast.Constant) and isinstance(attribute.value, str):
                            public_symbol(module_name, attribute.value)
                        elif path not in dynamic:
                            add("computed-import", path, module_name, "Computed access to a module interface belongs in a declared dynamicLoader.")
                if loading:
                    literal = node.args[0].value if node.args and isinstance(node.args[0], ast.Constant) and isinstance(node.args[0].value, str) else None
                    if literal and literal.startswith(".") and function == "importlib.import_module":
                        package_arg = node.args[1] if len(node.args) > 1 else next((k.value for k in node.keywords if k.arg == "package"), None)
                        if isinstance(package_arg, ast.Constant) and isinstance(package_arg.value, str):
                            import importlib.util
                            try:
                                literal = importlib.util.resolve_name(literal, package_arg.value)
                            except (ImportError, ValueError):
                                literal = None
                    if literal and not literal.startswith("."):
                        if literal.split(".")[0] in package_names and literal not in mapped:
                            add("unresolved-import", path, literal, "Dynamic internal import does not resolve.")
                        else:
                            target = literal if literal in mapped else literal.split(".")[0]
                            if target not in graph.modules:
                                graph.add_module(target, is_squashed=True)
                            graph.add_import(importer=name, imported=target)
                            if function in {"builtins.__import__", "__import__"}:
                                fromlist = node.args[3] if len(node.args) > 3 else next((k.value for k in node.keywords if k.arg == "fromlist"), None)
                                if fromlist is not None:
                                    try:
                                        entries = ast.literal_eval(fromlist)
                                    except (ValueError, TypeError):
                                        entries = None
                                    if not isinstance(entries, (tuple, list)) or any(not isinstance(e, str) for e in entries):
                                        if path not in dynamic:
                                            add("computed-import", path, function, "Computed __import__ fromlist belongs in a declared dynamicLoader.")
                                    else:
                                        for entry in entries:
                                            candidate = literal + "." + entry
                                            if candidate in mapped:
                                                graph.add_import(importer=name, imported=candidate)
                                            else:
                                                public_symbol(literal, entry)
                    elif path not in dynamic:
                        add("computed-import", path, function, "Nonliteral or relative dynamic imports belong in a declared dynamicLoader.")
                elif opaque and path not in dynamic:
                    add("computed-import", path, function, "Dynamic execution belongs in a declared dynamicLoader.")
    session = {"root_packages": package_names, "include_external_packages": "True"}

    def protect(rule, targets, allowed, message):
        if not targets:
            return
        result = ProtectedContract(rule, session, {"protected_modules": sorted(targets), "allowed_importers": sorted(allowed), "as_packages": "False"}).check(graph, False)
        for metadata in result.metadata["illegal_imports"]:
            for link in metadata.illegal_links:
                add(rule, mapped.get(link["importer"], link["importer"]), mapped.get(link["imported"], link["imported"]), message)

    for module in modules:
        own = {name for name, path in mapped.items() if owners.get(path) is module and path not in test_files}
        private = {name for name, path in mapped.items() if owners.get(path) is module and path not in public and path not in test_files}
        protect("private-import", private, own, "Call the owning module's declared public entry.")
        allowed = {name for name, path in mapped.items() if path in test_files or owners.get(path) is module or module["name"] in owners.get(path, {}).get("allow", [])}
        protect("forbidden-dependency", {name for name, path in mapped.items() if owners.get(path) is module}, allowed, "Declare this dependency in allow or move the responsibility to its owner.")
    for package, permitted in external.items():
        if package in graph.modules:
            protect("external-owner", {package}, {name for name, path in mapped.items() if owners.get(path, {}).get("name") in permitted and path not in test_files}, "Only declared infrastructure owners may import this package.")
    test_names = {name for name, path in mapped.items() if path in test_files}
    protect("forbidden-dependency", test_names, test_names, "Production modules must not depend on external contract tests.")
    # Aggregate native import edges by architecture owner, then use Grimp's cycle algorithm.
    aggregate = grimp.ImportGraph()
    aggregate.add_module("architecture")
    ids = {m["name"]: f"architecture.m{i}" for i, m in enumerate(modules)}
    edges = {}
    for identifier in ids.values():
        aggregate.add_module(identifier)
    for name, path in mapped.items():
        source_owner = owners.get(path)
        if source_owner is None or path in test_files:
            continue
        for target in graph.find_modules_directly_imported_by(name):
            target_path = mapped.get(target)
            target_owner = owners.get(target_path)
            if target_owner and target_owner is not source_owner and target_path not in test_files:
                pair = (ids[source_owner["name"]], ids[target_owner["name"]])
                aggregate.add_import(importer=pair[0], imported=pair[1])
                edges.setdefault(pair, []).append((path, target_path))
    for pair in sorted(edges):
        if aggregate.chain_exists(pair[1], pair[0]):
            for source, target in edges[pair]:
                add("module-cycle", source, target, "This dependency participates in a cross-module cycle.")
    baseline = contract.get("baseline", [])
    accepted = set()
    for entry in baseline:
        if set(entry) != {"rule", "from", "to", "reason"} or not all(isinstance(v, str) and v.strip() for v in entry.values()) or any(c in entry[k] for k in ("rule", "from", "to") for c in "*?[]{}"):
            raise ConfigurationError("Baseline entries require exact rule/from/to and a nonempty reason; no wildcard exemptions.")
        if entry["rule"] not in {"private-import", "forbidden-dependency", "module-cycle", "external-owner", "unresolved-import"}:
            raise ConfigurationError("Only exact dependency-edge violations may be baselined; exports, loaders, coverage and control failures cannot be exempted.")
        relative(entry["from"])
        key = (entry["rule"], entry["from"], entry["to"])
        if key in accepted:
            raise ConfigurationError("Duplicate baseline entry.")
        accepted.add(key)
        if not any((v["rule"], v["from"], v["to"]) == key for v in violations):
            add("unused-baseline", entry["from"], entry["to"], "Remove this resolved or mismatched baseline entry.")
    return [v for v in violations if (v["rule"], v["from"], v["to"]) not in accepted]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    report = {"ok": False, "violations": [], "errors": []}
    try:
        # Third party diagnostics must not corrupt the machine-readable public seam.
        with redirect_stdout(io.StringIO()):
            report["violations"] = check(Path(args.root).resolve())
        report["ok"] = not report["violations"]
        status = 0 if report["ok"] else 1
    except Exception as error:
        report["errors"].append(f"{type(error).__name__}: {error}")
        status = 2
    if args.json:
        print(json.dumps(report, ensure_ascii=True))
    else:
        print("Architecture PASS" if report["ok"] else "Architecture FAILED")
        for item in report["violations"]:
            print(f"[{item['rule']}] {item['from']} -> {item['to']}: {item['message']}")
        for error in report["errors"]:
            print(error)
    return status


if __name__ == "__main__":
    sys.exit(main())
