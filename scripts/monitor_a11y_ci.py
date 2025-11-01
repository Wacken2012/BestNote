#!/usr/bin/env python3
"""
Monitor GitHub Actions runs for a given branch, download the playwright-report artifact,
extract the embedded Playwright HTML reporter ZIP (index.html -> data:application/zip;base64 -> unzip),
extract axe-results-*.json attachments and run triage.

Usage:
  GITHUB_TOKEN=xxxxx python3 scripts/monitor_a11y_ci.py --branch feat/a11y-quickfixes

Notes:
 - The script uses the GitHub REST API and requires a token with repo access in a private repo.
 - If you prefer, install the GitHub CLI and run similarly; this script prefers GITHUB_TOKEN.
"""
import os
import sys
import time
import json
import urllib.request
import urllib.parse
import zipfile
import tempfile
import shutil
from pathlib import Path


def get_repo_from_git_remote():
    import subprocess
    try:
    
        url = subprocess.check_output(['git','remote','get-url','origin'], text=True).strip()
    except Exception:
        return None
    # url formats: git@github.com:owner/repo.git or https://github.com/owner/repo.git
    if url.startswith('git@'):
        parts = url.split(':',1)[1]
    elif url.startswith('https://'):
        parts = urllib.parse.urlparse(url).path.lstrip('/')
    
    # --- Accessibility diff: compare current axe-results with previous run
    else:
        parts = url
    if parts.endswith('.git'):
        parts = parts[:-4]
    if '/' not in parts:
        return None
    owner, repo = parts.split('/',1)
    return owner, repo


def gh_api_request(url, token):
    req = urllib.request.Request(url)
    req.add_header('Accept', 'application/vnd.github+json')
    req.add_header('User-Agent', 'a11y-monitor-script')
    if token:
        req.add_header('Authorization', f'token {token}')
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def download_url_to_file(url, token, out_path):
    req = urllib.request.Request(url)
    if token:
        req.add_header('Authorization', f'token {token}')
    with urllib.request.urlopen(req) as resp, open(out_path, 'wb') as fh:
        shutil.copyfileobj(resp, fh)


def extract_playwright_from_index(index_html_path, out_dir):
    # Find data:application/zip;base64,... inside index.html and write zip
    b64 = None
    import re, base64
    with open(index_html_path, 'r', encoding='utf-8', errors='ignore') as fh:
        txt = fh.read()
    m = re.search(r'data:application/zip;base64,([A-Za-z0-9+/=\n\r]+)"', txt)
    if not m:
        m = re.search(r'data:application/zip;base64,([A-Za-z0-9+/=\n\r]+)', txt)
    if not m:
        raise RuntimeError('No embedded base64 ZIP found in index.html')
    b64 = m.group(1)
    zip_bytes = base64.b64decode(b64)
    tmp_zip = Path(out_dir)/'report.zip'
    tmp_zip.write_bytes(zip_bytes)
    with zipfile.ZipFile(tmp_zip, 'r') as z:
        z.extractall(out_dir)
    return out_dir


def main():
    import argparse
    p = argparse.ArgumentParser()
    # --branch is optional when running against a local report directory (dry-run in CI)
    p.add_argument('--branch', required=False, default='')
    p.add_argument('--auto-comment', action='store_true', help='Post comment automatically when run finished')
    # local report usage (inside the same job): skip GitHub artifact download and read the playwright-report dir
    p.add_argument('--local-report-dir', help='Path to a local playwright-report directory to use instead of downloading the artifact')
    p.add_argument('--dry-run', action='store_true', help='Do not post comments or mutate GitHub; useful for CI dry-runs')
    p.add_argument('--verbose', action='store_true', help='Verbose logging')
    p.add_argument('--run-id', type=int, help='Use an explicit workflow run id (skip polling)')
    p.add_argument('--artifact-name', default='playwright-report')
    p.add_argument('--poll-interval', type=int, default=15)
    args = p.parse_args()

    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
    gh_cli = shutil.which('gh')
    use_gh = False
    if not token and not args.local_report_dir:
        # if we're given a local report dir we don't require a token
        if gh_cli:
            print('No GITHUB_TOKEN found — falling back to GitHub CLI (gh)')
            use_gh = True
        else:
            print('\nERROR: GITHUB_TOKEN or GH_TOKEN environment variable is required for the GitHub API access,')
            print('or install and authenticate with the GitHub CLI (`gh`).')
            sys.exit(2)

    repo = get_repo_from_git_remote()
    if not repo:
        print('Could not detect repository owner/name from git remote. Run this inside the repo with origin set.')
        sys.exit(2)
    owner, repo_name = repo
    print(f'Watching runs for {owner}/{repo_name} branch {args.branch}')

    # If a local report directory is provided, prefer that and skip artifact download
    if args.local_report_dir:
        if args.verbose:
            print('[VERBOSE] Running with --local-report-dir', args.local_report_dir)
        if args.dry_run:
            print('[DRY-RUN] Dry-run mode enabled: will not post comments')
        # locate index.html inside the provided directory
        local_path = Path(args.local_report_dir)
        idx = None
        if local_path.exists():
            for pth in local_path.rglob('index.html'):
                idx = pth
                break
        if not idx:
            print('index.html not found inside local report dir', args.local_report_dir)
            sys.exit(1)
        tmpd = Path(tempfile.mkdtemp(prefix='a11y-monitor-'))
        play_report_dir = tmpd / 'playwright-report'
        play_report_dir.mkdir(parents=True, exist_ok=True)
        try:
            extract_playwright_from_index(str(idx), str(play_report_dir))
        except Exception as e:
            print('Failed to extract embedded Playwright ZIP from local report:', e)
            sys.exit(1)
        print('Extracted playwright report into', play_report_dir)
        # continue to the reporting/triage section below using tmpd and play_report_dir

    runs_url = f'https://api.github.com/repos/{owner}/{repo_name}/actions/runs?branch={urllib.parse.quote(args.branch)}&per_page=1'

    # If a run-id is provided, skip polling and use it directly
    run_id = args.run_id
    if not run_id:
        # poll for the latest run for the branch
        while True:
            try:
                data = gh_api_request(runs_url, token)
            except Exception as e:
                print('GitHub API request failed:', e)
                sys.exit(1)
            runs = data.get('workflow_runs', [])
            if not runs:
                print('No runs found for branch yet; waiting', flush=True)
                time.sleep(args.poll_interval)
                continue
            run = runs[0]
            run_id = run.get('id')
            status = run.get('status')
            conclusion = run.get('conclusion')
            print(f'Found run id={run_id} status={status} conclusion={conclusion}')
            if status == 'completed':
                print('Run completed with conclusion=', conclusion)
                break
            print('Run not completed yet; polling...')
            time.sleep(args.poll_interval)

    # if local-report-dir was used above we will already have tmpd and play_report_dir
    if not args.local_report_dir:
        tmpd = Path(tempfile.mkdtemp(prefix='a11y-monitor-'))
        artifact_zip = tmpd / 'artifact.zip'
        print('Downloading artifact into', tmpd)
        if not use_gh:
        # find the artifact archive download URL for the given run_id and artifact name
        artifacts_api = f'https://api.github.com/repos/{owner}/{repo_name}/actions/runs/{run_id}/artifacts'
        try:
            art_data = gh_api_request(artifacts_api, token)
            dl_url = None
            for a in art_data.get('artifacts', []):
                if a.get('name') == args.artifact_name:
                    dl_url = a.get('archive_download_url')
                    break
            if not dl_url:
                raise RuntimeError('Artifact not found for run')
        except Exception as e:
            print('Failed to locate artifact via API:', e)
            sys.exit(1)

        print('Downloading artifact to', artifact_zip)
        download_url_to_file(dl_url, token, str(artifact_zip))
        print('Unzipping artifact...')
        with zipfile.ZipFile(artifact_zip, 'r') as z:
            z.extractall(tmpd)
    else:
        # use `gh run download` which will download and (by default) extract the artifact
        import subprocess
        try:
            # gh run download accepts the workflow run id
            subprocess.run(['gh', 'run', 'download', str(run_id), '--name', args.artifact_name, '--dir', str(tmpd)], check=True)
        except subprocess.CalledProcessError as e:
            print('gh run download failed:', e)
            sys.exit(1)

    # find index.html inside extracted artifact (or from local report extraction)
    idx = None
    for p in tmpd.rglob('index.html'):
        idx = p
        break
    if not idx:
        print('index.html not found in artifact; listing files:')
        for p in tmpd.rglob('*'):
            print(' ', p)
        sys.exit(1)

    print('Found index.html at', idx)
    # extract embedded Playwright reporter ZIP
    play_report_dir = tmpd / 'playwright-report'
    play_report_dir.mkdir(exist_ok=True)
    try:
        extract_playwright_from_index(str(idx), str(play_report_dir))
    except Exception as e:
        print('Failed to extract embedded Playwright ZIP:', e)
        sys.exit(1)

    print('Extracted playwright report into', play_report_dir)

    # Enhanced: impact grouping and markdown table formatting
    impact_order = {'critical': 0, 'serious': 1, 'moderate': 2, 'minor': 3, None: 4}

    def build_table(items, source_map):
        # items: iterable of (ruleId, target)
        rows = []
        for rid, target in items:
            example = source_map.get((rid, target))
            impact = example.get('impact') if example else None
            comp = map_component(example['html'] if example else '')
            helpUrl = example.get('helpUrl') if example else ''
            snippet = (example.get('html','')[:140].replace('\n','') if example else '')
            rows.append((impact_order.get(impact, 4), impact or '', rid or '', comp, helpUrl or '', snippet))
        # sort by impact_order then ruleId
        rows.sort(key=lambda r: (r[0], r[2]))
        if not rows:
            return ['- _None_']
        lines = []
        lines.append('| ruleId | impact | component | helpUrl | snippet |')
        lines.append('|---|---:|---|---|---|')
        for _, impact, rid, comp, helpUrl, snippet in rows:
            help_md = f'[{helpUrl.split("?")[0]}]({helpUrl})' if helpUrl else ''
            lines.append(f'| `{rid}` | {impact} | {comp} | {help_md} | `{snippet}` |')
        return lines

    # rebuild nicer markdown with impact-separated, collapsible sections
    run_url = f'https://github.com/{owner}/{repo_name}/actions/runs/{run_id}' if run_id else ''

    def build_tables_by_impact(keys, source_map):
        # group keys by impact
        groups = {'critical': [], 'serious': [], 'moderate': [], 'minor': []}
        for rid, target in keys:
            item = source_map.get((rid, target))
            impact = (item.get('impact') if item else None) or 'minor'
            impact = impact if impact in groups else 'minor'
            groups[impact].append((rid, target))
        lines = []
        for impact in ['critical', 'serious', 'moderate', 'minor']:
            lines.append(f'<details><summary>{impact.upper()} ({len(groups[impact])})</summary>')
            lines.append('')
            lines.extend(build_table(groups[impact], source_map))
            lines.append('')
            lines.append('</details>')
            lines.append('')
        return lines


def find_component_by_snippet(snippet):
    """Heuristic search: look for snippet text or selectors inside src/components and return best match.

    This is a best-effort heuristic: search component files for occurrences of id/class names or the snippet text.
    """
    import re
    root = Path('src')
    if not root.exists():
        return '-'
    snippet = (snippet or '').strip()
    candidates = {}
    # look for id or class fragments like #foo or .bar in snippet
    tokens = re.findall(r'[.#][A-Za-z0-9_-]+', snippet)
    # also add word tokens
    tokens += re.findall(r'[A-Za-z0-9_-]{4,}', snippet)
    for p in root.rglob('*.vue'):
        try:
            txt = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        score = 0
        for t in tokens:
            if t.startswith('#') or t.startswith('.'):
                if t[1:] in txt:
                    score += 3
            else:
                if t in txt:
                    score += 1
        if score > 0:
            candidates[str(p)] = score
    if not candidates:
        return '-'
    # return best scoring path (short path)
    best = max(candidates.items(), key=lambda kv: kv[1])[0]
    return best


def map_component(html):
    # use the heuristic finder on snippet content
    if not html:
        return '-'
    # trim long HTML
    snippet = html[:240]
    comp = find_component_by_snippet(snippet)
    return comp

    md2 = []
    md2.append(f'### Accessibility Diff Report — run {run_id} on branch {args.branch}')
    if run_url:
        md2.append(f'Full run: {run_url}')
    md2.append('')

    md2.append('#### ✅ Fixed')
    md2.extend(build_tables_by_impact(fixed, prev))

    md2.append('#### ⚠️ Still Present')
    md2.extend(build_tables_by_impact(still, curr))

    md2.append('#### 🆕 New Violations')
    md2.extend(build_tables_by_impact(new, curr))

    out_md2 = tmpd / 'accessibility-diff-pretty.md'
    out_md2.write_text('\n'.join(md2), encoding='utf-8')
    print('\n--- Accessibility pretty-diff written to', out_md2)

    # --- PR commenting: post the diff to the associated PR (if any)
    # safety: only proceed if we have at least one current axe-results file
    if not curr:
        print('No axe-results found in current run; skipping PR comment')
    else:
        comment_marker = '<!-- A11Y-DIFF-COMMENT -->\n'
        body = comment_marker + out_md2.read_text(encoding='utf-8') + '\n\n_Automatically generated accessibility diff. Changes shown for reviewers._'

        def get_pr_number_for_branch():
            # try gh first
            if use_gh:
                try:
                    import subprocess
                    out = subprocess.check_output(['gh','pr','view','--json','number'], text=True)
                    j = json.loads(out)
                    return j.get('number')
                except Exception as e:
                    print('gh pr view failed:', e)
            # fallback to GitHub API: list pulls with head=owner:branch
            if token:
                try:
                    api = f'https://api.github.com/repos/{owner}/{repo_name}/pulls?head={owner}:{urllib.parse.quote(args.branch)}&state=open'
                    data = gh_api_request(api, token)
                    if isinstance(data, list) and data:
                        return data[0].get('number')
                except Exception as e:
                    print('GitHub API PR lookup failed:', e)
            return None

        pr_num = get_pr_number_for_branch()
        if not pr_num:
            print('No PR found for branch; skipping PR comment')
        else:
            print('Found PR number', pr_num, '— attempting to post comment')

            def post_comment_via_gh(pr_number, text):
                try:
                    import subprocess
                    subprocess.run(['gh','pr','comment', str(pr_number), '--body', text], check=True)
                    return True
                except Exception as e:
                    print('gh comment failed:', e)
                    return False

            def post_comment_via_api(pr_number, text):
                try:
                    # find existing comments
                    comments_url = f'https://api.github.com/repos/{owner}/{repo_name}/issues/{pr_number}/comments'
                    existing = gh_api_request(comments_url, token)
                    # look for our marker
                    old_id = None
                    if isinstance(existing, list):
                        for c in existing:
                            if isinstance(c.get('body'), str) and c.get('body','').startswith(comment_marker):
                                old_id = c.get('id')
                                break
                    if old_id:
                        patch_url = f'https://api.github.com/repos/{owner}/{repo_name}/issues/comments/{old_id}'
                        req = urllib.request.Request(patch_url, method='PATCH')
                        req.add_header('Accept', 'application/vnd.github+json')
                        req.add_header('Authorization', f'token {token}')
                        req.add_header('Content-Type', 'application/json')
                        data = json.dumps({'body': text}).encode('utf-8')
                        with urllib.request.urlopen(req, data=data) as resp:
                            return True
                    else:
                        post_url = f'https://api.github.com/repos/{owner}/{repo_name}/issues/{pr_number}/comments'
                        req = urllib.request.Request(post_url, method='POST')
                        req.add_header('Accept', 'application/vnd.github+json')
                        req.add_header('Authorization', f'token {token}')
                        req.add_header('Content-Type', 'application/json')
                        data = json.dumps({'body': text}).encode('utf-8')
                        with urllib.request.urlopen(req, data=data) as resp:
                            return True
                except Exception as e:
                    print('API comment failed:', e)
                    return False

            posted = False
            if use_gh:
                posted = post_comment_via_gh(pr_num, body)
            if not posted and token:
                posted = post_comment_via_api(pr_num, body)
            if posted:
                print('Posted accessibility diff to PR', pr_num)
            else:
                print('Failed to post accessibility diff comment')
    # reuse existing local extraction/triage routines if present
    project_extract = Path('/tmp/extract_axe_attachments.py')
    project_triage = Path('/tmp/triage_member_import.py')
    # fallback: try scripts in repo
    repo_extract = Path('scripts/extract_axe_attachments.py')
    if project_extract.exists():
        print('Running /tmp/extract_axe_attachments.py')
        import subprocess
        subprocess.run(['python3', str(project_extract), str(play_report_dir), str(play_report_dir / 'playwright-report')])
    elif repo_extract.exists():
        print('Running repo script scripts/extract_axe_attachments.py')
        import subprocess
        subprocess.run(['python3', str(repo_extract), str(play_report_dir), str(play_report_dir / 'playwright-report')])
    else:
        # try to find attachments in report.json
        print('No extractor found; attempting to find axe-results attachments directly...')
        try:
            rpt = play_report_dir / 'report.json'
            if rpt.exists():
                with open(rpt, 'r', encoding='utf-8') as fh:
                    data = json.load(fh)
                # save any attachment bodies named axe-results*.json
                outdir = play_report_dir / 'playwright-report'
                outdir.mkdir(exist_ok=True)
                count = 0
                def walk(obj):
                    nonlocal count
                    if isinstance(obj, dict):
                        for k,v in obj.items():
                            if k == 'attachments' and isinstance(v, list):
                                for att in v:
                                    name = att.get('name')
                                    body = att.get('body')
                                    if name and body and name.startswith('axe-results') and name.endswith('.json'):
                                        with open(outdir / name, 'w', encoding='utf-8') as out:
                                            try:
                                                parsed = json.loads(body)
                                                json.dump(parsed, out, indent=2, ensure_ascii=False)
                                            except Exception:
                                                out.write(body)
                                        print('WROTE', outdir / name)
                                        count += 1
                            else:
                                walk(v)
                    elif isinstance(obj, list):
                        for it in obj:
                            walk(it)
                walk(data)
                if count == 0:
                    print('No embedded axe-results attachments found in report.json')
        except Exception as e:
            print('Fallback extraction failed:', e)

    # run triage if available
    triage_script = Path('/tmp/triage_member_import.py')
    if triage_script.exists():
        print('Running triage...')
        import subprocess
        subprocess.run(['python3', str(triage_script)])
    else:
        print('No triage script found at /tmp/triage_member_import.py; you can run /tmp/triage_member_import.py manually')

    print('\nDone. Temporary files in', tmpd)


if __name__ == '__main__':
    main()
