Create Release workflow

This GitHub Actions workflow automatically creates a GitHub Release when a tag matching `v*` is pushed.

Features
- Extracts the release notes for the tag from `CHANGELOG.md` (section like `## [2.0.0]`) and uses it as the release body.
- Uploads `CHANGELOG.md` as a release asset.
- Can also be run manually via `workflow_dispatch` and accepts an optional `tag` input.

How to use

1. Push an annotated tag (e.g. `git tag -a v2.0.0 -m "..." && git push origin v2.0.0`).
2. The workflow triggers automatically and publishes the release using the repository's `GITHUB_TOKEN`.

Manual run

Go to Actions → Create Release → Run workflow. Optionally pass `tag` if you want to override the detected ref.

Notes
- The workflow uses the provided `CHANGELOG.md` to build the body. Make sure the changelog includes a section for the version tag (e.g. `## [2.0.0]`).
- The built-in `GITHUB_TOKEN` is used to publish the release. No additional secrets are required for the basic flow.
