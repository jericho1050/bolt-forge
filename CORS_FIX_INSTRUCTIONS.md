# CORS Fix for Appwrite + bolt.new

## The Problem
Your Appwrite project is rejecting requests because the platform settings only allow `https://localhost`, but bolt.new serves from a different domain pattern:
```
Current origin: https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--10996a95.local-credentialless.webcontainer-api.io
Allowed origin: https://localhost (configured in Appwrite)
```

## Immediate Solution

### Step 1: Update Appwrite Platform Settings

1. **Go to your Appwrite Console**: https://cloud.appwrite.io/console/project-68485f160000a988c05a

2. **Navigate to Settings > Platforms**

3. **Find your Web platform** (or create one if it doesn't exist)

4. **Update the Hostname field** to include bolt.new patterns:
   ```
   *.bolt.new
   *.local-credentialless.webcontainer-api.io
   localhost
   127.0.0.1
   ```

5. **Save the changes**

### Step 2: Add Multiple Hostnames (Recommended)

Since bolt.new can use different domain patterns, add these hostnames:

```
localhost
127.0.0.1
*.bolt.new
*.local-credentialless.webcontainer-api.io
*.webcontainer-api.io
```

### Step 3: Verify Platform Configuration

Your platform settings should look like this:

**Platform Type**: Web
**Name**: Bolt-Forge Web App
**Hostnames**:
- `localhost`
- `127.0.0.1`
- `*.bolt.new`
- `*.local-credentialless.webcontainer-api.io`

## Alternative Quick Fix

If you need an immediate workaround, you can temporarily add the exact current domain:

1. Copy this domain from your error: `zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--10996a95.local-credentialless.webcontainer-api.io`

2. Add it to your Appwrite platform hostnames

3. **Note**: This domain might change when you restart bolt.new, so the wildcard approach above is better

## Testing the Fix

After updating the platform settings:

1. **Wait 1-2 minutes** for changes to propagate
2. **Refresh your bolt.new app**
3. **Try the authentication flow again**

You can test the connection in your browser console:
```javascript
fetch('https://syd.cloud.appwrite.io/v1/health')
  .then(r => r.json())
  .then(data => console.log('✅ Connection works:', data))
  .catch(err => console.error('❌ Still blocked:', err));
```

## Common Mistakes to Avoid

1. **Don't use HTTP**: bolt.new uses HTTPS, make sure your platform config doesn't include HTTP variants
2. **Don't forget wildcards**: Use `*.bolt.new` not just `bolt.new`
3. **Don't remove localhost**: Keep localhost for local development

## If CORS Issues Persist

1. **Clear browser cache** and refresh
2. **Check for typos** in the hostname configuration
3. **Verify the project ID** matches your environment variable
4. **Try incognito mode** to rule out browser extension issues

## Future Prevention

To avoid this issue in future bolt.new projects:

1. Always include wildcard patterns for bolt.new domains
2. Set up platform configuration before starting development
3. Use environment detection in your app to handle different origins

## Verification Steps

After making changes, verify:

1. ✅ No CORS errors in browser console
2. ✅ Appwrite health endpoint responds
3. ✅ Authentication requests work
4. ✅ OAuth redirects function properly

The fix should resolve the CORS issue immediately once the platform settings are updated.