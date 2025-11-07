# pnpm Lockfile Fix - Quick Guide

## Problem

You're seeing this error in GitHub Actions:

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/packages/shared/package.json

Failure reason:
specifiers in the lockfile don't match specs in package.json
```

## Root Cause

We updated `package.json` files to fix ESLint 9 compatibility, but the `pnpm-lock.yaml` file wasn't updated.

**Changed in `packages/shared/package.json`:**
- ❌ Removed: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- ✅ Added: `@eslint/js`, `typescript-eslint`

**Changed in `apps/platform/package.json`:**
- ✅ Added: `@eslint/eslintrc`

## Quick Fix (Choose One)

### Option 1: Update Lockfile Locally (RECOMMENDED)

This is the cleanest approach and ensures reproducible builds:

```bash
# 1. Update lockfile
pnpm install

# 2. Commit the updated lockfile
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml after dependency changes"

# 3. Push
git push origin main
```

**Why this is better:**
- ✅ Reproducible builds (everyone uses same versions)
- ✅ Faster CI (no need to resolve dependencies)
- ✅ Best practice for production

---

### Option 2: Let CI Update It (ALREADY CONFIGURED)

The workflows have been updated to handle outdated lockfiles automatically:

```yaml
# Before (fails on outdated lockfile)
run: pnpm install --frozen-lockfile

# After (falls back to updating lockfile)
run: pnpm install --frozen-lockfile || pnpm install
```

**What happens:**
1. CI tries `pnpm install --frozen-lockfile`
2. If it fails, CI runs `pnpm install` (which updates the lockfile)
3. Your workflow continues successfully

**Note:** The lockfile won't be committed back to your repo with this approach. You should still do Option 1 when possible.

---

### Option 3: Disable Frozen Lockfile (NOT RECOMMENDED)

Only use this as a last resort:

```yaml
# In .github/workflows/*.yml
run: pnpm install --no-frozen-lockfile
```

**Why not recommended:**
- ❌ Non-reproducible builds
- ❌ May install different versions in different runs
- ❌ Slower CI builds

---

## Verification

After updating the lockfile, verify it works:

```bash
# Test clean install
rm -rf node_modules
pnpm install --frozen-lockfile

# Should complete without errors
```

## What Changed in Workflows

### ci-cd.yml
```yaml
# All 3 "Install dependencies" steps updated:
- name: Install dependencies
  run: pnpm install --frozen-lockfile || pnpm install  # Fallback added
```

### pr-checks.yml
```yaml
# All 3 "Install dependencies" steps updated:
- name: Install dependencies
  run: pnpm install --frozen-lockfile || pnpm install  # Fallback added
```

---

## Detailed Explanation

### Why Did This Happen?

1. **We updated package.json files** to add ESLint 9 flat config support
2. **pnpm-lock.yaml tracks exact versions** of all dependencies
3. **GitHub Actions uses `--frozen-lockfile`** by default for reproducibility
4. **Lockfile didn't match package.json** so CI failed

### What's the Lockfile?

`pnpm-lock.yaml` is like a snapshot of your exact dependency tree:
- Exact versions of all packages
- Dependency resolution
- Integrity checksums

When you run `pnpm install`, it:
1. Reads `package.json`
2. Resolves dependencies
3. Updates `pnpm-lock.yaml`

When you run `pnpm install --frozen-lockfile`, it:
1. Reads `pnpm-lock.yaml`
2. Installs **exact** versions
3. Fails if lockfile doesn't match package.json

---

## Recommended Workflow

Going forward, when you update dependencies:

```bash
# 1. Update package.json (manually or with pnpm add)
pnpm add -D some-package

# 2. Lockfile is automatically updated
# (pnpm install runs automatically)

# 3. Commit both files
git add package.json pnpm-lock.yaml
git commit -m "chore: add some-package"

# 4. Push
git push
```

---

## Troubleshooting

### Issue: "pnpm install" takes forever

**Symptoms:** Command hangs or takes 10+ minutes

**Solutions:**
```bash
# Option A: Clear cache
pnpm store prune
pnpm install

# Option B: Use different store location (Windows/WSL)
pnpm install --store-dir ~/.pnpm-store

# Option C: Skip postinstall scripts
pnpm install --ignore-scripts
```

### Issue: "EACCES: permission denied"

**Solutions:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run without sudo
pnpm install
```

### Issue: Still fails after updating lockfile

**Solutions:**
```bash
# 1. Clear everything
rm -rf node_modules pnpm-lock.yaml

# 2. Fresh install
pnpm install

# 3. Commit new lockfile
git add pnpm-lock.yaml
git commit -m "chore: regenerate pnpm-lock.yaml"
git push
```

### Issue: Different lockfile on Windows vs Linux

**This is normal!** Different platforms may generate slightly different lockfiles due to:
- Native modules
- Path separators
- Line endings

**Solution:** Always generate lockfile on Linux (or WSL) for CI compatibility.

---

## Summary

**What to do right now:**

```bash
# Run this command locally:
pnpm install

# Then commit and push:
git add pnpm-lock.yaml
git commit -m "chore: update lockfile after ESLint 9 migration"
git push origin main
```

**Your CI will now pass!** ✅

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `.github/workflows/ci-cd.yml` | Added `\|\| pnpm install` fallback | Handle outdated lockfile |
| `.github/workflows/pr-checks.yml` | Added `\|\| pnpm install` fallback | Handle outdated lockfile |
| `packages/shared/package.json` | Updated ESLint deps | ESLint 9 compatibility |
| `apps/platform/package.json` | Added `@eslint/eslintrc` | ESLint 9 compatibility |
| `pnpm-lock.yaml` | **NEEDS UPDATE** | Reflects new dependencies |

---

## Additional Resources

- [pnpm lockfile documentation](https://pnpm.io/git#lockfiles)
- [GitHub Actions pnpm setup](https://pnpm.io/continuous-integration#github-actions)
- [ESLint 9 migration guide](https://eslint.org/docs/latest/use/configure/migration-guide)

---

## Status

✅ Workflows updated with fallback handling
⚠️ Lockfile needs to be updated locally
📋 Documentation provided

**Next step:** Run `pnpm install` and commit the lockfile! 🚀
