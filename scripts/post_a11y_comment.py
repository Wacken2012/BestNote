#!/usr/bin/env python3
"""Post or update an accessibility comment to the PR for a branch.

Usage:
  GITHUB_TOKEN=xxx python3 scripts/post_a11y_comment.py --branch feat/a11y-quickfixes --file /path/to/accessibility-diff-pretty.md

This finds the open PR for the given branch and posts or updates a comment that starts with the marker
`<!-- A11Y-DIFF-COMMENT -->`.
"""
import os
import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path

MARKER = '<!-- A11Y-DIFF-COMMENT -->\n'


def get_repo():
    import subprocess
    try:
        url = subprocess.check_output(['git', 'remote', 'get-url', 'origin'], text=True).strip()
    except Exception:
        return None
    if url.startswith('git@'):
        parts = url.split(':', 1)[1]
    else:
        parts = urllib.parse.urlparse(url).path.lstrip('/')
    if parts.endswith('.git'):
        parts = parts[:-4]
    owner, repo = parts.split('/', 1)
    return owner, repo


def gh_api_request(url, token, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Accept', 'application/vnd.github+json')
    req.add_header('Authorization', f'token {token}')
    if data is not None:
        b = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        with urllib.request.urlopen(req, data=b) as resp:
            return json.load(resp)
    else:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)


def gh_cli_request_json(path, method='GET', data=None):
    """Use `gh api` to call GitHub API and return parsed JSON.

    path should be a relative API path like 'repos/owner/repo/issues...'
    """
    import subprocess
    cmd = ['gh', 'api']
    if method and method.upper() != 'GET':
        cmd += ['-X', method.upper()]
    cmd.append(f'/{path}')
    # if data provided, pass as -f key=value for simple JSON-serializable values
    if isinstance(data, dict):
        for k, v in data.items():
            # gh accepts -f key=value and will JSON-encode values as needed
            cmd += ['-f', f'{k}={v}']
    try:
        proc = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if proc.stdout:
            return json.loads(proc.stdout)
    except subprocess.CalledProcessError as e:
        # bubble up a simple error
        raise RuntimeError(f"gh api error: {e.stderr.strip()}")
    return None


def find_pr_for_branch(owner, repo, branch, token):
    # prefer API call with token if available
    if token:
        q = f'https://api.github.com/repos/{owner}/{repo}/pulls?head={owner}:{urllib.parse.quote(branch)}&state=open'
        data = gh_api_request(q, token)
        if isinstance(data, list) and data:
            return data[0].get('number')
        return None
    # fallback to gh CLI (uses the authenticated gh session)
    try:
        path = f'repos/{owner}/{repo}/pulls?head={owner}:{urllib.parse.quote(branch)}&state=open'
        data = gh_cli_request_json(path)
        if isinstance(data, list) and data:
            return data[0].get('number')
    except Exception:
        return None
    return None


def post_or_update_comment(owner, repo, pr_number, token, body):
    # If token is present, use direct API calls
    if token:
        comments_url = f'https://api.github.com/repos/{owner}/{repo}/issues/{pr_number}/comments'
        existing = gh_api_request(comments_url, token)
        old_id = None
        if isinstance(existing, list):
            for c in existing:
                if isinstance(c.get('body'), str) and c.get('body','').startswith(MARKER):
                    old_id = c.get('id')
                    break
        if old_id:
            patch_url = f'https://api.github.com/repos/{owner}/{repo}/issues/comments/{old_id}'
            gh_api_request(patch_url, token, method='PATCH', data={'body': body})
            return True
        else:
            post_url = f'https://api.github.com/repos/{owner}/{repo}/issues/{pr_number}/comments'
            gh_api_request(post_url, token, method='POST', data={'body': body})
            return True

    # Fallback using gh CLI (relies on gh authentication)
    try:
        # list comments
        path = f'repos/{owner}/{repo}/issues/{pr_number}/comments'
        existing = gh_cli_request_json(path)
        old_id = None
        if isinstance(existing, list):
            for c in existing:
                if isinstance(c.get('body'), str) and c.get('body','').startswith(MARKER):
                    old_id = c.get('id')
                    break
        if old_id:
            # gh api PATCH /repos/:owner/:repo/issues/comments/:comment_id -f body='...'
            patch_path = f'repos/{owner}/{repo}/issues/comments/{old_id}'
            gh_cli_request_json(patch_path, method='PATCH', data={'body': body})
            return True
        else:
            post_path = f'repos/{owner}/{repo}/issues/{pr_number}/comments'
            gh_cli_request_json(post_path, method='POST', data={'body': body})
            return True
    except Exception as e:
        print('gh fallback failed:', e)
        return False


def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument('--branch', required=True)
    p.add_argument('--file', required=True)
    args = p.parse_args()

    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
    if not token:
        print('No GITHUB_TOKEN/GH_TOKEN env var set; will attempt to use `gh` CLI as fallback')

    repo = get_repo()
    if not repo:
        print('Could not detect repo from git remote')
        sys.exit(2)
    owner, repo_name = repo

    pr_num = find_pr_for_branch(owner, repo_name, args.branch, token)
    if not pr_num:
        print('No open PR found for branch', args.branch)
        sys.exit(1)

    md = Path(args.file).read_text(encoding='utf-8')
    body = MARKER + md + '\n\n_Automatically generated accessibility diff._'

    ok = post_or_update_comment(owner, repo_name, pr_num, token, body)
    if ok:
        print('Posted/updated accessibility comment to PR', pr_num)
    else:
        print('Failed to post comment')


if __name__ == '__main__':
    main()
