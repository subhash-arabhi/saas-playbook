# Screenshots and Videos in Pull Requests

<!-- Vendored from microsoft/playwright-cli@b85c7a7 (Apache-2.0, see licenses/). Changes: rewritten to commit images and videos to the pr-assets branch and link them, instead of uploading them with gh's attach flag; CI keeps failure output as a workflow artifact. -->

Images and videos for a PR go on the repository's **`pr-assets` branch**, which never merges into `main`, under `pr-<branch-name>/`. The PR description links to them. Don't upload them with `gh`'s attach flag. In a project with the SaaS playbook, `.agents/workflows/push.md` says when to capture them (desktop and mobile, before and after) and pushes the branch only when the user says "push".

## When to include

Include visual evidence when it saves the reviewer a checkout: a screenshot of a UI fix, a before/after pair, a short video of a new user-facing flow. Skip it for refactors, backend-only changes and anything the diff already shows. Never capture secrets or real personal data.

## From a local session

```bash
# capture the evidence
playwright-cli open http://localhost:3000/settings
playwright-cli screenshot --filename=settings-after.png
playwright-cli video-start settings-flow.webm
playwright-cli click e5
playwright-cli fill e7 "New name" --submit
playwright-cli video-stop

# commit it to pr-assets in a separate worktree, so the working branch is untouched
git fetch origin pr-assets && git worktree add ../pr-assets pr-assets
# (first time only, when the branch doesn't exist: git worktree add --orphan -b pr-assets ../pr-assets)
mkdir -p ../pr-assets/pr-fix-settings-name
cp settings-after.png settings-flow.webm ../pr-assets/pr-fix-settings-name/
git -C ../pr-assets add pr-fix-settings-name
git -C ../pr-assets commit -m "Screenshots for fix-settings-name"
```

Pushing `pr-assets` happens with the working branch, when the user says "push".

Then link the files in the PR description. Images show inline; videos open from the link:

```markdown
![Settings page after saving](https://github.com/<owner>/<repo>/raw/pr-assets/pr-fix-settings-name/settings-after.png)
[Recording of the new flow](https://github.com/<owner>/<repo>/raw/pr-assets/pr-fix-settings-name/settings-flow.webm)
```

## Keep them small

- Crop screenshots to what changed, and keep recordings short (record at a modest size such as 1280x800).
- Remove the worktree when you're done: `git worktree remove ../pr-assets`.

## From CI

Keep the screenshots and videos Playwright Test saves under `test-results` (`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`) as a workflow artifact, and link the run from the PR when it helps:

```yaml
steps:
  - run: npx playwright test
  - name: Keep failure screenshots and videos
    if: failure()
    uses: actions/upload-artifact@<commit-sha> # pin by SHA
    with:
      name: playwright-results
      path: test-results/
      retention-days: 7
```

For a polished walkthrough of a new feature, record a hero script as described in [video-recording.md](video-recording.md) and add the resulting WebM to `pr-assets` the same way.
