from monitor_a11y_ci import extract_playwright_from_index


def test_extract_playwright_from_index_basic():
    # Minimal test: ensure function runs without error on dummy input
    html = "<html><body><script>window.__a11y__ = { violations: [] }</script></body></html>"
    result = extract_playwright_from_index(html)
    assert isinstance(result, dict)
    assert "violations" in result
