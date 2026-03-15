---
name: sync-upstream
description: Rebase this fork's commits on top of upstream/main, force-push to origin, and update the parent project's submodule pointer. Use when the fork falls behind upstream.
disable-model-invocation: true
---

# Sync Fork with Upstream

This repo is a fork with `upstream` pointing to the original repo and `origin` pointing to the fork. It may be a git submodule of a parent project.

## Steps

1. **Discover context** — run these commands to understand the setup:
   - `git remote -v` to confirm `upstream` and `origin` exist
   - `git branch --show-current` to get the current branch
   - `git rev-parse --show-superproject-working-tree` to detect if this is a submodule (empty output means it's not)
   - `basename $(pwd)` to get this repo's directory name (needed for the submodule update step)

   If `upstream` remote doesn't exist, warn the user and stop.

2. **Ensure clean working tree** — run `git status`. If there are uncommitted changes, warn the user and stop.

3. **Fetch upstream** — run `git fetch upstream`.

4. **Check for new upstream commits** — compare the current branch with `upstream/main`. If already up to date, inform the user and stop.

5. **Rebase onto upstream/main** — run `git rebase upstream/main`.
   - If there are merge conflicts, show the conflicting files and stop. Tell the user to resolve conflicts and then re-run `/sync-upstream`.
   - If the rebase succeeds, show the rebased commit log.

6. **Run tests** — detect and run the project's test suite:
   - Check `package.json` for a `test` script. If found, run it with `npx vitest run` or `npm test` as appropriate.
   - If tests fail, warn the user. Do NOT proceed to push. Suggest fixing the failures first.
   - If no test script is found, skip this step and note it in the summary.

7. **Force-push to origin** — run `git push origin <current-branch> --force-with-lease`.

8. **Update parent submodule pointer** — only if step 1 detected a parent project:
   ```
   cd <superproject-working-tree>
   git add <submodule-directory-name>
   git commit -m "Update <submodule-directory-name> submodule to latest upstream"
   ```

9. **Summary** — show what happened:
   - How many new upstream commits were incorporated
   - How many local commits were rebased on top
   - Test results (or note that tests were skipped)
   - Whether the parent project was updated
