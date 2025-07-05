# Admin User Setup Instructions

## Creating the Admin User

Since Firebase Auth requires browser environment for user creation, you'll need to create the admin user through the Firebase Console or by temporarily allowing registration in your app.

### Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Users
4. Click "Add User"
5. Enter:
   - **Email**: `admin@admin.com`
   - **Password**: `admin1234`
6. After creating the user, copy the UID
7. Go to Firestore Database > users collection
8. Create a new document with the UID as the document ID and the following data:
   ```json
   {
     "email": "admin@admin.com",
     "firstName": "Admin",
     "lastName": "User",
     "department": "IT",
     "title": "System Administrator",
     "role": "admin",
     "createdAt": 1641234567890,
     "updatedAt": 1641234567890
   }
   ```

### Option 2: Temporary Registration (Alternative)

1. Temporarily add a registration form to your app
2. Create the admin user through the UI
3. Update the user's role to "admin" in Firestore
4. Remove the registration form

## User Roles

The system supports three roles:

### Viewer

- **Permissions**: Can only view requests and comments
- **Restrictions**: Cannot create requests, add comments, or delete anything
- **UI**: All action buttons are hidden

### User (Default)

- **Permissions**: Can view, create requests, add comments, edit/delete own content
- **Restrictions**: Cannot delete other users' content or manage users
- **UI**: Full access to request management features

### Admin

- **Permissions**: Full access to all features plus user management
- **Additional Features**:
  - User management modal accessible via "Users" button in header
  - Can create, edit, and delete users
  - Can change user roles
  - Can delete any request or comment
- **UI**: Additional "Users" button in header, full admin controls

## Default User Credentials

When creating new users through the admin panel:

- **Default Password**: `1234` (users should change this on first login)
- **Default Role**: `user`

## Admin Login

- **Email**: `admin@admin.com`
- **Password**: `admin1234`
