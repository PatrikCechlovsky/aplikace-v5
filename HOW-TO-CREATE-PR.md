# How to Create Pull Request

## Branch Information
- **Feature Branch:** `feature/030-detail-tabs-consistent`
- **Base Branch:** Based on commit after PR #35 (`0f802e1`)
- **Total Commits:** 7
- **Files Changed:** 5 (2 code, 3 documentation)
- **Changes:** +1,097 lines added, -306 lines removed

## Creating the Pull Request

### Via GitHub Web Interface

1. **Navigate to Repository**
   - Go to: https://github.com/PatrikCechlovsky/aplikace-v5

2. **Start New PR**
   - Click "Pull requests" tab
   - Click "New pull request" button
   - Or click "Compare & pull request" if GitHub shows the banner

3. **Select Branches**
   - Base branch: `main` (or the default branch)
   - Compare branch: `feature/030-detail-tabs-consistent`

4. **Fill PR Details**

**Title:**
```
feat: Consistent tabs implementation for modules 030, 040, 050 with security fixes
```

**Description:**
```markdown
## Overview
This PR implements consistent tab structure across modules 030 (Pronajímatel), 040 (Nemovitost), and 050 (Nájemník) as specified in Modul 030.docx.

## Related
- Closes: (add issue number if applicable)
- References: PR #35 (https://github.com/PatrikCechlovsky/aplikace-v5/pull/35)
- Document: Modul 030.docx

## Changes Summary

### Module 030 (Pronajímatel)
✅ **Verified** - Already had correct implementation, no changes needed

### Module 040 (Nemovitost)
✅ **Major restructure completed:**
- Moved renderForm inside first tab "Základní údaje"
- Removed 'refresh' action, added 'wizard' with toast notification
- Added System tab with formatted metadata
- Fixed 2 XSS vulnerabilities
- Added error handling for async operations
- Removed unused imports

### Module 050 (Nájemník)
✅ **Tab reordering completed:**
- Moved "Profil nájemníka" to first position
- Logical order: Profil → Smlouvy → Jednotky → Nemovitosti → Dokumenty → Systém
- Fixed 1 XSS vulnerability
- Added error handling for all async tabs
- Removed placeholder tabs

## Security & Quality
- ✅ **CodeQL scan:** 0 vulnerabilities
- ✅ **Fixed:** 3 XSS vulnerabilities
- ✅ **Code review:** Passed
- ✅ **Syntax validation:** Passed

## Documentation
Added comprehensive documentation:
- `PR-SUMMARY.md` - Complete PR overview and migration guide
- `TABS-CONSISTENCY-SUMMARY.md` - Implementation details and patterns
- `VISUAL-CHANGES.md` - Before/after visual comparison

## Testing
**Automated (Complete):**
- ✅ JavaScript syntax validation
- ✅ CodeQL security scan
- ✅ Code review
- ✅ Structure verification

**Manual (Required):**
- [ ] UI testing with Supabase backend
- [ ] Tab switching verification
- [ ] Async data loading tests
- [ ] Navigation flow tests

## Benefits
1. ✅ Consistent user experience across all modules
2. ✅ No security vulnerabilities
3. ✅ Better UX with toast notifications
4. ✅ Clean, maintainable code
5. ✅ Pattern ready for modules 060, 070, 080

## Statistics
- **Commits:** 7
- **Files changed:** 5
- **Lines:** +1,097 / -306
- **Net:** +791 lines

## Screenshots
(Add screenshots after manual testing)

## Checklist
- [x] Code changes implemented
- [x] Security issues fixed
- [x] Documentation added
- [x] Code review passed
- [x] Security scan passed
- [ ] Manual testing completed
- [ ] Screenshots added

## Next Steps
After merge:
1. Apply same pattern to modules 060, 070, 080
2. Implement full wizard functionality
3. Add automated tests for tab switching
```

5. **Add Reviewers**
   - Add @PatrikCechlovsky as reviewer
   - Add any other team members

6. **Add Labels** (if available)
   - `enhancement`
   - `security`
   - `documentation`
   - `ui/ux`

7. **Create PR**
   - Click "Create pull request"

## Via GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
cd /home/runner/work/aplikace-v5/aplikace-v5
gh pr create \
  --title "feat: Consistent tabs implementation for modules 030, 040, 050 with security fixes" \
  --body-file PR-SUMMARY.md \
  --base main \
  --head feature/030-detail-tabs-consistent \
  --label enhancement,security,documentation \
  --reviewer PatrikCechlovsky
```

## Verifying Before PR

Before creating the PR, verify:

```bash
# Check branch is up to date
git fetch origin
git status

# Review commits
git log feature/030-detail-tabs-consistent --not main --oneline

# Review changes
git diff main...feature/030-detail-tabs-consistent

# Check for conflicts
git merge-base main feature/030-detail-tabs-consistent
```

## After Creating PR

1. **Wait for CI/CD** (if configured)
   - GitHub Actions should run automatically
   - Check for any failures

2. **Address Review Comments**
   - Respond to reviewer feedback
   - Make additional commits if needed

3. **Manual Testing**
   - Test the changes locally
   - Add screenshots to PR description

4. **Request Re-review**
   - After addressing comments
   - Notify reviewers

## Merging

Once approved:

1. **Merge Strategy Options:**
   - "Squash and merge" (recommended for clean history)
   - "Rebase and merge" (preserves commits)
   - "Create a merge commit" (preserves full history)

2. **After Merge:**
   - Delete feature branch (GitHub offers this)
   - Pull latest changes to local main
   - Start work on next modules (060, 070, 080)

## Troubleshooting

### Branch is behind main
```bash
git checkout feature/030-detail-tabs-consistent
git rebase origin/main
# Resolve conflicts if any
git push --force-with-lease origin feature/030-detail-tabs-consistent
```

### Need to update PR
```bash
git checkout feature/030-detail-tabs-consistent
# Make changes
git add .
git commit -m "Address review feedback"
git push origin feature/030-detail-tabs-consistent
```

## Notes

- The branch is already pushed to: `origin/feature/030-detail-tabs-consistent`
- All commits are clean and have descriptive messages
- Documentation is comprehensive and ready for review
- Security issues have been addressed and verified
- The implementation follows the pattern established in PR #35
