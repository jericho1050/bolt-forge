# Appwrite OAuth Troubleshooting Guide for bolt.new

## Current Configuration Analysis

### Your Setup
- **Environment**: bolt.new (browser-based development)
- **Appwrite Endpoint**: `syd.cloud.appwrite.io` (Sydney region)
- **SDK Version**: `appwrite@18.1.1`
- **OAuth Providers**: GitHub and Google
- **Redirect Strategy**: Homepage-based (`/`)

### Environment Variables
```env
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68485f160000a988c05a
```

## Common OAuth Issues & Solutions

### 1. Callback URL Configuration Issues

#### Problem: OAuth redirect fails or shows invalid redirect URI
**Symptoms**:
- OAuth provider shows "Invalid redirect URI" error
- User gets redirected to wrong URL after OAuth
- OAuth flow completes but user returns to wrong page

**Solution**:
In your Appwrite Console → Auth → Settings:

**For GitHub**:
```
Success URL: https://68485f160000a988c05a.bolt.new/
Failure URL: https://68485f160000a988c05a.bolt.new/?error=oauth_failed
```

**For Google**:
```
Success URL: https://68485f160000a988c05a.bolt.new/
Failure URL: https://68485f160000a988c05a.bolt.new/?error=oauth_failed
```

**bolt.new URL Pattern**: `https://[PROJECT_ID].bolt.new/`

### 2. OAuth Provider Configuration

#### GitHub OAuth Setup
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App with:
   ```
   Application name: Bolt-Forge
   Homepage URL: https://68485f160000a988c05a.bolt.new
   Authorization callback URL: https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/68485f160000a988c05a
   ```

#### Google OAuth Setup
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID:
   ```
   Application type: Web application
   Authorized JavaScript origins: https://68485f160000a988c05a.bolt.new
   Authorized redirect URIs: https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68485f160000a988c05a
   ```

### 3. bolt.new Specific Issues

#### Problem: Dynamic URLs in bolt.new
**Issue**: bolt.new assigns dynamic URLs that change between sessions
**Solution**: 
- Use environment variables for base URL detection
- Implement dynamic URL detection

```typescript
// Add to your OAuth implementation
const getBaseUrl = () => {
  // In bolt.new, use the current origin
  return window.location.origin;
};

const signInWithOAuth = async (provider: OAuthProvider) => {
  const baseUrl = getBaseUrl();
  
  await account.createOAuth2Session(
    provider,
    `${baseUrl}/`,
    `${baseUrl}/?error=oauth_failed`
  );
};
```

#### Problem: CORS and bolt.new
**Issue**: Cross-origin requests might be blocked
**Solution**: 
- Verify Appwrite platform settings include your bolt.new domain
- Add wildcard for bolt.new domains in Appwrite Console

### 4. Network Connectivity Issues

#### Problem: Connection to syd.cloud.appwrite.io fails
**Symptoms**:
- "Failed to fetch" errors
- Network timeouts
- CORS errors

**Debugging Steps**:

1. **Test Direct Connection**:
```bash
curl -v https://syd.cloud.appwrite.io/v1/health
```

2. **Check from Browser Console**:
```javascript
fetch('https://syd.cloud.appwrite.io/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

3. **Verify Project Access**:
```javascript
// In browser console
fetch('https://syd.cloud.appwrite.io/v1/projects/68485f160000a988c05a', {
  headers: {
    'X-Appwrite-Project': '68485f160000a988c05a'
  }
}).then(r => r.json()).then(console.log);
```

### 5. Authentication Flow Debugging

#### Current Implementation Issues
Your current auth flow in `src/contexts/AuthContext.tsx`:

```typescript
// Potential issue: Aggressive session deletion
try {
  await account.deleteSession('current');
} catch (err) {
  // This might cause issues if session is already invalid
}
```

#### Improved OAuth Flow
```typescript
const signInWithOAuth = async (provider: OAuthProvider) => {
  try {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Get current URL for dynamic redirect
    const baseUrl = window.location.origin;
    
    // Don't delete session before OAuth - let Appwrite handle it
    await account.createOAuth2Session(
      provider,
      `${baseUrl}/auth/callback`, // Consider dedicated callback route
      `${baseUrl}/?error=oauth_failed`
    );
  } catch (err) {
    console.error('OAuth error:', err);
    setState(prev => ({
      ...prev,
      error: `OAuth failed: ${err.message}`,
      isLoading: false,
    }));
    throw err;
  }
};
```

### 6. Appwrite Console Checklist

#### Project Settings
- [ ] Project ID matches environment variable
- [ ] Platform is set to "Web"
- [ ] Hostname includes your bolt.new domain: `*.bolt.new`

#### Auth Settings
- [ ] Email/Password auth is enabled
- [ ] OAuth providers are enabled and configured
- [ ] Security settings allow your domain

#### OAuth Provider Settings
- [ ] GitHub OAuth app configured with correct callback URL
- [ ] Google OAuth client configured with correct origins
- [ ] Client IDs and secrets properly set in Appwrite

### 7. Common Error Messages & Solutions

#### "Invalid redirect URI"
- **Cause**: Mismatch between OAuth provider config and Appwrite redirect URL
- **Fix**: Update OAuth provider settings with correct Appwrite callback URL

#### "Failed to fetch"
- **Cause**: Network/CORS issues
- **Fix**: Check Appwrite platform settings and network connectivity

#### "Session not found"
- **Cause**: Premature session deletion or invalid session handling
- **Fix**: Use improved session validation from your recent fixes

#### "Unauthorized domain"
- **Cause**: bolt.new domain not added to Appwrite platform
- **Fix**: Add `*.bolt.new` to platform settings

### 8. Testing OAuth Flow

#### Step-by-Step Testing
1. **Test Basic Appwrite Connection**:
```javascript
// In browser console
import { account } from './src/lib/appwrite';
account.get().then(console.log).catch(console.error);
```

2. **Test OAuth Redirect**:
   - Click OAuth button
   - Check browser network tab for redirect requests
   - Verify redirect URL format

3. **Test Callback Handling**:
   - Complete OAuth flow
   - Check if user lands on correct page
   - Verify session is created

#### Debug OAuth URLs
Your OAuth callback URLs should follow this pattern:
```
https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/[provider]/[project-id]
```

For your project:
- GitHub: `https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/68485f160000a988c05a`
- Google: `https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68485f160000a988c05a`

### 9. bolt.new Environment Considerations

#### URL Handling
- bolt.new URLs are dynamic and can change
- Use `window.location.origin` for dynamic URL detection
- Consider using relative URLs where possible

#### Local Storage
- bolt.new supports localStorage for session persistence
- Appwrite sessions should persist across browser refreshes

#### Network Restrictions
- Some bolt.new instances might have network restrictions
- Test OAuth from different bolt.new sessions if issues persist

### 10. Advanced Debugging

#### Enable Appwrite Debug Mode
```typescript
// Add to your appwrite.ts
import { Client, Account, Databases, Storage, Teams } from 'appwrite';

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setSelfSigned(false) // Ensure HTTPS validation
  .setJWT('') // Clear any existing JWT
  .setSession(''); // Clear any existing session
```

#### Monitor Network Requests
```javascript
// Add to debug OAuth issues
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch request:', args);
  const response = await originalFetch(...args);
  console.log('Fetch response:', response);
  return response;
};
```

### 11. Quick Fix Checklist

For immediate OAuth troubleshooting:

1. **Verify URLs**:
   - [ ] bolt.new URL in OAuth provider config
   - [ ] Appwrite callback URL in OAuth provider
   - [ ] Platform settings in Appwrite include bolt.new domain

2. **Test Network**:
   - [ ] Can reach syd.cloud.appwrite.io
   - [ ] No CORS errors in browser console
   - [ ] Appwrite health endpoint responds

3. **Check Configuration**:
   - [ ] Project ID is correct
   - [ ] OAuth providers are enabled in Appwrite
   - [ ] Client IDs/secrets are properly set

4. **Test Flow**:
   - [ ] OAuth redirect starts correctly
   - [ ] User can complete OAuth on provider site
   - [ ] User returns to your app successfully
   - [ ] Session is created and profile is fetched

### 12. If All Else Fails

1. **Try Different Region**: Switch from `syd.cloud.appwrite.io` to `cloud.appwrite.io`
2. **Create New OAuth Apps**: Fresh OAuth applications with correct settings
3. **Test in Different Browser**: Rule out browser-specific issues
4. **Contact Appwrite Support**: With your project ID and specific error messages

## Quick Recovery Script

Add this to your AuthContext for OAuth debugging:

```typescript
const debugOAuth = async () => {
  console.log('=== OAuth Debug Info ===');
  console.log('Current URL:', window.location.href);
  console.log('Base URL:', window.location.origin);
  console.log('Project ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID);
  console.log('Endpoint:', import.meta.env.VITE_APPWRITE_ENDPOINT);
  
  try {
    const user = await account.get();
    console.log('Current user:', user);
  } catch (err) {
    console.log('No current user:', err);
  }
};
```

Call `debugOAuth()` from browser console when OAuth issues occur.