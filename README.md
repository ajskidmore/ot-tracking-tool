# OT Tracking Tool

A comprehensive web application for occupational therapists to track patient assessments, progress, and treatment goals.

## Live Demo

🌐 **Deployed Application**: [https://ot-tracking-tool.web.app](https://ot-tracking-tool.web.app)

## Features

### Sprint 1: Authentication ✅ (Completed)
- User registration and login with email/password
- Protected routes for authenticated users
- User profile management
- Secure Firebase Authentication
- Professional UI with responsive design

### Upcoming Sprints
- **Sprint 2**: Patient Management System
- **Sprint 3**: Program Evaluation Assessments
- **Sprint 4**: Progress Visualization with Charts
- **Sprint 5-6**: ROM Assessment and Visualization
- **Sprint 7-8**: Goal Tracking and Session Notes
- **Sprint 9**: Photo/Video Upload
- **Sprint 10**: Dashboard and Reporting
- **Sprint 11**: Final Polish and UX

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Firebase (Authentication, Firestore, Storage, Hosting)
- **Routing**: React Router v6
- **Styling**: Custom CSS with responsive design
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v20.18.0 or compatible)
- npm or yarn
- Firebase CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ajskidmore/ot-tracking-tool.git
cd ot-tracking-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your Firebase configuration (already configured for this project).

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Firebase Setup

### Enable Authentication

⚠️ **IMPORTANT**: You need to enable Email/Password authentication in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/project/ot-tracking-tool/authentication)
2. Click on "Authentication" in the left sidebar
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable both "Email/Password" and optionally "Email link (passwordless sign-in)"
6. Click "Save"

### Firestore Database

Firestore has been automatically created with security rules that:
- Allow users to only access their own data
- Require authentication for all operations
- Protect patient, assessment, and goal data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

The application is automatically deployed to Firebase Hosting. To deploy manually:

```bash
npm run build
firebase deploy --project ot-tracking-tool
```

## Project Structure

```
ot-tracking-tool/
├── src/
│   ├── components/        # React components
│   │   ├── Auth.css      # Authentication styles
│   │   ├── Dashboard.css # Dashboard styles
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── firebase.js       # Firebase configuration
│   ├── App.jsx          # Main app component
│   ├── App.css          # App styles
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── dist/                # Production build
├── .env                 # Environment variables (not in git)
├── .env.example        # Environment template
├── firebase.json       # Firebase configuration
├── firestore.rules     # Firestore security rules
└── README.md

```

## Security

- All sensitive configuration is stored in environment variables
- Firestore security rules enforce data access control
- Authentication required for all protected routes
- User data is isolated and protected

## Contributing

This is a personal project for occupational therapy practice management. Feel free to fork and adapt for your own use.

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

Built with Claude Code for efficient occupational therapy practice management.
