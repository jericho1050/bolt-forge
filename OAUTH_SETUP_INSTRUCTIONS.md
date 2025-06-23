# OAuth Setup Instructions for Bolt-Forge

This guide will help you configure GitHub and Google OAuth providers for your Bolt-Forge application using Appwrite.

## Prerequisites

- Appwrite project configured at `syd.cloud.appwrite.io`
- Project ID: `68485f160000a988c05a`
- Admin access to your Appwrite Console

## 1. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:

```
Application name: Bolt-Forge Platform
Homepage URL: https://68485f160000a988c05a.bolt.new
Application description: Micro-internship platform connecting developers with companies
Authorization callback URL: https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/68485f160000a988c05a
```

4. Click "Register application"
5. Note down the **Client ID** and generate a **Client Secret**

### Step 2: Configure GitHub in Appwrite Console

1. Go to [Appwrite Console](https://cloud.appwrite.io/console/project-68485f160000a988c05a)
2. Navigate to **Auth > Settings**
3. Scroll to **OAuth2 Providers**
4. Find **GitHub** and click **Enable**
5. Enter your GitHub OAuth credentials:
   - **App ID**: Your GitHub Client ID
   - **App Secret**: Your GitHub Client Secret
6. Click **Update**

## 2. Google OAuth Setup

### Step 1: Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen if prompted
6. Choose **Web application** as application type
7. Configure the client:

```
Name: Bolt-Forge Platform
Authorized JavaScript origins: 
  - https://68485f160000a988c05a.bolt.new
  - https://syd.cloud.appwrite.io

Authorized redirect URIs:
  - https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68485f160000a988c05a
```

8. Click **Create**
9. Note down the **Client ID** and **Client Secret**

### Step 2: Configure Google in Appwrite Console

1. Go to [Appwrite Console](https://cloud.appwrite.io/console/project-68485f160000a988c05a)
2. Navigate to **Auth > Settings**
3. Scroll to **OAuth2 Providers**
4. Find **Google** and click **Enable**
5. Enter your Google OAuth credentials:
   - **App ID**: Your Google Client ID
   - **App Secret**: Your Google Client Secret
6. Click **Update**

## 3. Appwrite Platform Configuration

Ensure your Appwrite project has the correct platform configuration:

1. Go to **Settings > Platforms**
2. Add or update your Web platform with these hostnames:
   ```
   *.bolt.new
   *.local-credentialless.webcontainer-api.io
   localhost
   127.0.0.1
   ```

## 4. Environment Variables

Your `.env` file should already contain:

```env
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68485f160000a988c05a
```

No additional environment variables are needed for OAuth as the credentials are managed in Appwrite Console.

## 5. Testing OAuth Flow

### Test GitHub OAuth:
1. Open your application
2. Click "Sign In"
3. Click "Continue with GitHub"
4. You should be redirected to GitHub for authorization
5. After approval, you should be redirected back to your app and logged in

### Test Google OAuth:
1. Open your application  
2. Click "Sign In"
3. Click "Continue with Google"
4. You should be redirected to Google for authorization
5. After approval, you should be redirected back to your app and logged in

## 6. Troubleshooting

### Common Issues:

**"Invalid redirect URI" error:**
- Verify the callback URLs in GitHub/Google match exactly with Appwrite's expected format
- Check that your bolt.new domain is correctly configured

**"Domain not authorized" error:**
- Ensure your current bolt.new domain is added to Appwrite platform settings
- Add wildcard domains (`*.bolt.new`) to handle dynamic bolt.new URLs

**OAuth succeeds but user not logged in:**
- Check browser console for errors
- Verify Appwrite project permissions allow user creation
- Ensure profile creation succeeds after OAuth

### Debug OAuth URLs:

Your OAuth callback URLs should be:
- **GitHub**: `https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/68485f160000a988c05a`
- **Google**: `https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68485f160000a988c05a`

Your success/failure URLs will be dynamically set to:
- **Success**: `https://[your-current-bolt-url]/`
- **Failure**: `https://[your-current-bolt-url]/?error=oauth_failed`

## 7. User Data Mapping

When users sign in via OAuth, the application will:

1. Create or update their Appwrite user account
2. Map OAuth profile data to our profile structure:
   - GitHub: Maps username, bio, location, website
   - Google: Maps name, avatar, email
3. Create a developer profile by default (users can change to company later)
4. Set up proper permissions for the user's profile

## 8. Security Considerations

- OAuth secrets are stored securely in Appwrite Console
- User sessions are managed by Appwrite with proper security
- Profile permissions ensure users can only edit their own data
- Rate limiting prevents OAuth abuse
- Network error handling ensures graceful degradation

## Next Steps

After setting up OAuth:

1. Test both GitHub and Google authentication flows
2. Verify user profiles are created correctly
3. Test the sign-out process
4. Configure any additional OAuth scopes if needed
5. Monitor OAuth success/failure rates in Appwrite Console

For additional help, refer to the `APPWRITE_OAUTH_TROUBLESHOOTING.md` file in your project.