# Action Tracker - Vue 3 SPA

A Vue 3 + TypeScript single-page application for managing action requests with role-based permissions.

## Features

- 🔐 **Secure Authentication** - Firebase Authentication with persistent sessions
- 👥 **Role-Based Access** - Viewer, User, and Admin roles with different permissions
- 📋 **Request Management** - Create, view, comment, and manage action requests
- 💾 **Persistent State** - User sessions maintained across browser restarts
- 🎨 **Modern UI** - Built with Vuestic UI components
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Architecture

### User Store

- **Persistent Authentication**: Sessions stored in localStorage (7-day expiration)
- **Reactive State**: Real-time updates across components
- **Permission-Based**: Computed properties for easy permission checks
- **Security**: No sensitive data stored locally

### Role System

- **Viewer**: Read-only access to requests and comments
- **User**: Can create requests, comment, and manage own content
- **Admin**: Full access including user management

### Single Page Application

- **Home Dashboard**: Action boxes for easy navigation
- **Request Management**: List, create, and manage requests
- **User Management**: Admin-only user role management
- **Profile Management**: Edit user profiles and settings

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the environment template and configure your Firebase settings:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase configuration values.

### 3. Create Admin User

```bash
node create-admin-user.js
```

This creates an admin user with the credentials specified in your `.env` file.

**Note:** The script requires the `dotenv` package which is included in the dependencies.

### 4. Start Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## User Management

### Creating Users

1. **Through the App**: Admin users can create new users via the User Management modal
2. **Script**: Use the `create-admin-user.js` script for initial setup
3. **Firebase Console**: Manually create users in Firebase Auth and Firestore

### Changing User Roles

1. **Admin Interface**: Use the User Management modal (admin only)
2. **Firebase Console**: Edit the `role` field in the `users` collection
3. **Script**: Use the Firebase Admin SDK

For detailed instructions, see [USER_ROLES_GUIDE.md](./USER_ROLES_GUIDE.md).

## File Structure

```
src/
├── components/          # Vue components
│   ├── HomePage/        # Main dashboard component
│   ├── RequestList/     # Request listing component
│   ├── UserAvatar/      # User profile dropdown
│   └── ...
├── services/            # Firebase services
│   └── firebase.ts      # Firebase configuration and API
├── stores/             # State management
│   └── userStore.ts    # User authentication store
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## Key Technologies

- **Vue 3**: Composition API with reactive state
- **TypeScript**: Type-safe development
- **Firebase**: Authentication and Firestore database
- **Vuestic UI**: Modern component library
- **Vue CLI**: Build tooling and development server

## Security Features

- **Client-side permission checks** with reactive computed properties
- **Firebase Security Rules** for server-side validation
- **Session management** with automatic expiration
- **Role-based access control** throughout the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
