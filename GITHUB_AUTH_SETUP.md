# GitHub Authentication Setup

This document explains how the GitHub API authentication system works in RepoMind and how to configure it for Cloudflare Workers deployment.

## Overview

RepoMind now supports authenticated GitHub API requests, which provides:
- **Higher rate limits**: 5,000 requests/hour (authenticated) vs 60 requests/hour (unauthenticated)
- **Access to private repositories** (if token has appropriate permissions)
- **Better reliability** for production deployments

## How It Works

The system automatically detects and uses a GitHub Personal Access Token (PAT) if available:

1. **Cloudflare Workers**: Reads from `GITHUB_TOKEN` environment variable
2. **Local Development**: Falls back to `process.env.GITHUB_TOKEN`
3. **Graceful Fallback**: If no token is found, requests are made unauthenticated

## Configuration

### For Cloudflare Workers (Production)

Since you've already added the token to Cloudflare's environment variables, the system will automatically use it. The token is accessed through the Cloudflare Workers runtime environment.

**Note**: Your GitHub Personal Access Token should be configured as a secret in the Cloudflare dashboard under Workers & Pages > Your Worker > Settings > Variables. The variable name should be `GITHUB_TOKEN`.

The token is automatically injected into API requests via the Authorization header:
```
Authorization: Bearer <your-github-token>
```

### For Local Development

Set the environment variable before running the development server:

**Windows (PowerShell)**:
```powershell
$env:GITHUB_TOKEN="your_github_token_here"
npm run dev
```

**Windows (CMD)**:
```cmd
set GITHUB_TOKEN=your_github_token_here
npm run dev
```

**Linux/Mac**:
```bash
export GITHUB_TOKEN="your_github_token_here"
npm run dev
```

Or create a `.env` file in the project root:
```env
GITHUB_TOKEN=your_github_token_here
```

**Important**: Never commit your `.env` file or actual token to version control. The `.gitignore` file should include `.env`.

## Implementation Details

### Modified Files

1. **`src/lib/github.server.ts`**
   - Added `setGitHubEnv()` function to accept Cloudflare environment context
   - Updated `headers()` function to support both Cloudflare and Node.js environments
   - Enhanced rate limit error handling with detailed messages
   - Added graceful fallback for all GitHub API calls

2. **`src/routes/api/analyze.ts`**
   - Extracts Cloudflare environment variables from request context
   - Calls `setGitHubEnv()` to configure GitHub API authentication
   - Maintains all existing functionality

3. **`wrangler.jsonc`**
   - Added documentation about environment variable configuration
   - Configured for Cloudflare Workers deployment

## Rate Limit Handling

The system now provides improved rate limit handling:

- **Detailed error messages**: Shows exact time until rate limit reset
- **Graceful degradation**: Non-critical API calls (languages, README, files) fail silently
- **User-friendly feedback**: Clear messages when rate limits are exceeded

Example error message:
```
GitHub API rate limit exceeded. Please try again in 15 minutes.
```

## Security Notes

- The GitHub token is **never exposed** to the client
- All API calls are made server-side only
- Token is accessed securely through Cloudflare's environment system
- Falls back gracefully if token is missing or invalid

## Verification

To verify the authentication is working:

1. Check the response headers from GitHub API calls (server logs)
2. Monitor rate limit headers: `x-ratelimit-remaining` should show 5000 (authenticated) instead of 60 (unauthenticated)
3. Test with a repository analysis - authenticated requests should complete faster and more reliably

## Troubleshooting

**Issue**: Rate limits still showing 60/hour
- **Solution**: Verify the token is correctly set in Cloudflare dashboard
- Check server logs for authentication errors

**Issue**: "GitHub API rate limit reached" errors
- **Solution**: Wait for the rate limit to reset (shown in error message)
- Verify token has not expired or been revoked

**Issue**: Token not working locally
- **Solution**: Ensure environment variable is set before starting dev server
- Check token has correct permissions (public_repo scope minimum)

## Token Permissions

The current token should have at least these scopes:
- `public_repo` - Access public repositories
- `read:org` - Read organization data (optional)
- `read:user` - Read user profile data (optional)

## Future Enhancements

Possible improvements for the future:
- Token rotation support
- Multiple token support for load balancing
- Automatic token validation on startup
- Rate limit monitoring dashboard