# Troubleshooting Guide

## Common Issues and Solutions

### 1. Next.js Build Manifest Errors

**Error:**
```
Error: ENOENT: no such file or directory, open '.next/static/development/_buildManifest.js.tmp...'
```

**Solutions:**

#### Option A: Use Standard Dev Server (Recommended)
```bash
npm run dev
```
This uses the standard Next.js bundler which is more stable.

#### Option B: Clean Cache and Restart
```bash
npm run clean
npm run dev
```

#### Option C: Use Turbopack (May be unstable)
```bash
npm run dev:turbo
```
Note: Turbopack is experimental and may have temporary file issues.

### 2. Environment Variables Not Working

**Problem**: Appwrite connections failing or getting default values

**Solution:**
1. Ensure `.env.local` exists (copy from `.env.example`)
2. Restart the dev server after changing env variables
3. Check console for warnings about missing variables

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### 3. TypeScript Errors

**Problem**: Type errors in IDE or build

**Solution:**
```bash
# Clean build artifacts
npm run clean

# Rebuild
npm run build

# If issues persist, delete node_modules
rm -rf node_modules package-lock.json
npm install
```

### 4. Linting Issues

**Problem**: Biome showing errors

**Solution:**
```bash
# Check what's wrong
npm run lint

# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

### 5. Port Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**

Find and kill the process:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### 6. Slow Hot Reload

**Problem**: Changes taking too long to reflect

**Solutions:**
1. Use turbopack: `npm run dev:turbo`
2. Reduce watched files in `.gitignore`
3. Close other resource-intensive apps
4. Clear cache: `npm run clean`

### 7. Build Fails with Out of Memory

**Error:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Or add to `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### 8. Module Not Found Errors

**Problem**: Can't resolve module or import

**Solutions:**
1. Check import paths use `@/` alias correctly
2. Restart TypeScript server in IDE
3. Clean and reinstall:
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### 9. Hydration Errors

**Error:**
```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Common Causes:**
- Using browser-only APIs in server components
- Incorrect use of `useEffect` timing
- Mismatched HTML from third-party scripts

**Solution:**
- Ensure components are properly marked with `'use client'`
- Check for `window` or `document` usage in server components
- Verify date/time formatting consistency

### 10. i18n/Localization Issues

**Problem**: Translations not loading or locale switching broken

**Solution:**
1. Check `i18n/locales/` folder has all language JSON files
2. Verify `middleware.ts` locale configuration
3. Clear browser cache
4. Restart dev server

```bash
# Check locale files exist
ls -la i18n/locales/

# Should show: en.json, fr.json, es.json
```

## Quick Fixes Checklist

When something goes wrong, try these in order:

1. ✅ Clear cache: `npm run clean`
2. ✅ Restart dev server
3. ✅ Check environment variables
4. ✅ Run linter: `npm run lint:fix`
5. ✅ Delete `node_modules` and reinstall
6. ✅ Check for typos in imports/paths
7. ✅ Restart IDE TypeScript server

## Getting Help

If issues persist:

1. Check the error message carefully
2. Review [FIXES.md](./FIXES.md) for context
3. Check Next.js documentation: https://nextjs.org/docs
4. Check the GitHub issues for similar problems
5. Provide error logs when asking for help

## Performance Tips

- Use `npm run dev` for stable development
- Use `npm run dev:turbo` only if you need faster builds
- Keep dependencies up to date
- Monitor bundle sizes with `npm run build`
- Use React DevTools and Next.js DevTools for debugging
