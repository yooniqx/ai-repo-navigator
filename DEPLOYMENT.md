# RepoMind - Cloudflare Pages Deployment Guide

This application is configured for **Cloudflare Pages** deployment with full SSR support.

## Prerequisites

- GitHub account
- Cloudflare account (free tier works)
- Repository pushed to GitHub

## Deployment Steps

### Option 1: Cloudflare Pages (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Create application** → **Pages**
   - Click **Connect to Git**
   - Select your GitHub repository: `ai-repo-navigator`

3. **Configure Build Settings**
   - **Framework preset**: None (or TanStack Start if available)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)
   - **Node version**: `18` or higher

4. **Environment Variables (Optional)**
   Add these if you want higher GitHub API rate limits:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token
     - Without token: 60 requests/hour
     - With token: 5,000 requests/hour

5. **Deploy**
   - Click **Save and Deploy**
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-project.pages.dev`

### Option 2: Cloudflare Workers (Advanced)

If you want to use Cloudflare Workers directly with Wrangler CLI:

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   npm run build
   wrangler deploy
   ```

## Configuration Files

### `wrangler.jsonc`
- Configures Cloudflare Workers deployment
- Includes Durable Objects for distributed rate limiting
- Node.js compatibility enabled

### `vite.config.ts`
- Uses `@lovable.dev/vite-tanstack-config`
- Includes Cloudflare adapter
- Custom server entry point for error handling

## Features Enabled

✅ **Server-Side Rendering (SSR)** - Fast initial page loads
✅ **API Routes** - `/api/analyze` and `/api/chat` work correctly
✅ **Rate Limiting** - In-memory rate limiting (10 req/min for analyze, 20 req/min for chat)
✅ **Edge Deployment** - Global CDN with <50ms latency
✅ **Automatic HTTPS** - SSL certificates included
✅ **Custom Domains** - Add your own domain in Cloudflare dashboard

## Troubleshooting

### Build Fails
- Ensure Node.js version is 18 or higher
- Check that all dependencies are installed: `npm install`
- Verify build works locally: `npm run build`

### API Routes Return 404
- Verify build output directory is set to `dist`
- Check that SSR is enabled (not static export)
- Ensure `wrangler.jsonc` is in the repository root

### Rate Limiting Not Working
- This is expected - in-memory rate limiting works per worker instance
- For distributed rate limiting, Durable Objects need to be enabled (requires paid plan)
- Current implementation is sufficient for demo/hackathon purposes

### GitHub API Rate Limit
- Add `GITHUB_TOKEN` environment variable in Cloudflare Pages settings
- Generate token at: https://github.com/settings/tokens
- Permissions needed: `public_repo` (read-only)

## Custom Domain Setup

1. Go to your Cloudflare Pages project
2. Click **Custom domains**
3. Add your domain (must be on Cloudflare DNS)
4. DNS records are automatically configured
5. SSL certificate is automatically provisioned

## Monitoring

- **Analytics**: Available in Cloudflare Pages dashboard
- **Logs**: View real-time logs in Cloudflare dashboard
- **Performance**: Check Core Web Vitals and response times

## Cost

- **Free Tier**: 500 builds/month, unlimited requests
- **Paid Plan**: $20/month for advanced features
- **Durable Objects**: $5/month minimum (optional, for distributed rate limiting)

## Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- TanStack Start Docs: https://tanstack.com/start/
- GitHub Issues: https://github.com/yourusername/ai-repo-navigator/issues

---

**Note**: This application is optimized for Cloudflare Pages. Vercel and other platforms require significant reconfiguration.