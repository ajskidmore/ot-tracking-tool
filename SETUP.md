# Setup Instructions

## Final Step: Enable Firebase Authentication

Before you can use the application, you need to enable Email/Password authentication in the Firebase Console.

### Steps:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/project/ot-tracking-tool/authentication

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar (Build section)
   - If prompted, click "Get started"

3. **Enable Email/Password Sign-in**
   - Go to the "Sign-in method" tab
   - Find "Email/Password" in the list of providers
   - Click on it
   - Toggle "Enable" to ON
   - Click "Save"

4. **Test the Application**
   - Visit: https://ot-tracking-tool.web.app
   - Click "Register here" to create a new account
   - Fill in your details and register
   - You should be redirected to the dashboard

### Troubleshooting

If you see an error like "auth/operation-not-allowed" or "This operation is not allowed", it means authentication hasn't been enabled yet. Follow the steps above.

## What's Next?

Once authentication is working, you're ready to use Sprint 1 features:
- User registration
- User login
- Protected dashboard access
- User profile management

The next sprint will add patient management functionality!

## Application URLs

- **Live Application**: https://ot-tracking-tool.web.app
- **Firebase Console**: https://console.firebase.google.com/project/ot-tracking-tool/overview
- **GitHub Repository**: https://github.com/ajskidmore/ot-tracking-tool

## Need Help?

If you encounter any issues:
1. Check that Email/Password authentication is enabled in Firebase Console
2. Check browser console for error messages
3. Verify that Firestore database is created (it should be created automatically)
4. Make sure you're using a valid email address format
