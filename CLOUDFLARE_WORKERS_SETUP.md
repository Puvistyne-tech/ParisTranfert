# Cloudflare Workers Deployment Setup

This project is now configured to deploy to **Cloudflare Workers** using the official [@opennextjs/cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) adapter.

## What Was Configured

### 1. Dependencies Installed
- ✅ `@opennextjs/cloudflare` - Cloudflare adapter for Next.js
- ✅ `wrangler` - Cloudflare CLI tool (dev dependency)

### 2. Configuration Files Created
- ✅ `wrangler.toml` - Wrangler configuration file
- ✅ `open-next.config.ts` - OpenNext configuration file

### 3. Package.json Scripts Added
- ✅ `preview` - Build and preview locally in Workers runtime
- ✅ `deploy` - Build and deploy to Cloudflare Workers
- ✅ `cf-typegen` - Generate TypeScript types for Cloudflare environment

## Deployment Steps

### First Time Setup

1. **Authenticate with Cloudflare:**
   ```bash
   npx wrangler login
   ```

2. **Test locally with Workers runtime:**
   ```bash
   npm run preview
   ```
   This builds your app and serves it locally using the `workerd` runtime (same as production).

3. **Deploy to Cloudflare Workers:**
   ```bash
   npm run deploy
   ```
   This will:
   - Build your Next.js app for Cloudflare
   - Deploy to a `*.workers.dev` subdomain
   - Give you a URL to access your deployed app

### Development Workflow

- **Regular Next.js dev server** (fastest, Node.js runtime):
  ```bash
  npm run dev
  ```

- **Preview in Workers runtime** (more accurate to production):
  ```bash
  npm run preview
  ```

## Configuration Details

### wrangler.toml
- **main**: Points to the generated worker file
- **name**: Your project name (`paris-tranfert`)
- **compatibility_date**: Set to `2025-03-25` (required for Next.js support)
- **compatibility_flags**: Includes `nodejs_compat` for Node.js compatibility
- **assets**: Static assets configuration

### open-next.config.ts
- Uses the default Cloudflare configuration
- Can be customized for caching strategies (see [adapter documentation](https://opennext.js.org/cloudflare))

## Environment Variables

To add environment variables for your Cloudflare Workers deployment:

1. **Via Wrangler CLI:**
   ```bash
   npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
   ```

2. **Via Cloudflare Dashboard:**
   - Go to Workers & Pages → Your Worker → Settings → Variables

3. **For client-side variables**, prefix with `NEXT_PUBLIC_`

## Custom Domain

To use a custom domain:

1. Go to Cloudflare Dashboard → Workers & Pages → Your Worker
2. Navigate to Settings → Triggers → Custom Domains
3. Add your domain

## Features Supported

According to the [official documentation](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), the following Next.js features are supported:

- ✅ Static Site Generation (SSG)
- ✅ Server-Side Rendering (SSR)
- ✅ Incremental Static Regeneration (ISR)
- ✅ Server Actions
- ✅ Response streaming
- ✅ Middleware
- ✅ Image optimization (via Cloudflare Images)
- ✅ Partial Prerendering (PPR) - experimental
- ✅ Composable Caching - experimental

## Troubleshooting

### Build Errors
- Make sure `compatibility_date` is set to `2024-09-23` or later
- Ensure `nodejs_compat` flag is enabled in `wrangler.toml`

### Runtime Errors
- Test with `npm run preview` before deploying
- Check Cloudflare Workers logs in the dashboard

### Environment Variables
- Client-side variables must be prefixed with `NEXT_PUBLIC_`
- Server-side variables can be set via Wrangler secrets or dashboard

## Resources

- [Official Cloudflare Next.js Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [@opennextjs/cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Next Steps

1. ✅ Configuration complete
2. ⏭️ Run `npx wrangler login` to authenticate
3. ⏭️ Test locally with `npm run preview`
4. ⏭️ Deploy with `npm run deploy`
5. ⏭️ Configure environment variables
6. ⏭️ Set up custom domain (optional)

