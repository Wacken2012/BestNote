"""Minimal unit test for the a11y monitor extractor.

This test is intentionally defensive about how the monitor shim/module is
imported because CI checkouts sometimes differ in working directory and
python path. Try a normal import first; if that fails, load the module by
file path from the repository root or from the `scripts/` folder.
"""

from importlib import util
import pathlib
import sys


def _load_monitor():
    """Return extract_playwright_from_index from a found module.

    Tries in order:
    1. Direct import `monitor_a11y_ci`.
    2. Load `monitor_a11y_ci.py` from repository root.
    3. Load `scripts/monitor_a11y_ci.py`.
    Raises ImportError if none found.
    """
    try:
        # fastest path (works in local runs)
        from monitor_a11y_ci import extract_playwright_from_index

        return extract_playwright_from_index
    except Exception:
        pass

    # Determine repo root relative to this test file (tests/..)
    repo_root = pathlib.Path(__file__).resolve().parents[1]

    candidates = [repo_root / 'monitor_a11y_ci.py', repo_root / 'scripts' / 'monitor_a11y_ci.py']
    for candidate in candidates:
        if candidate.exists():
            spec = util.spec_from_file_location('monitor_a11y_ci', str(candidate))
            mod = util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            return mod.extract_playwright_from_index

    raise ImportError('Could not locate monitor_a11y_ci module or script')


def test_extract_playwright_from_index_basic():
    extract_playwright_from_index = _load_monitor()

    # Minimal test: ensure function runs without error on dummy input
    html = "<html><body><script>window.__a11y__ = { violations: [] }</script></body></html>"
    result = extract_playwright_from_index(html)
    assert isinstance(result, dict)
    assert "violations" in result
