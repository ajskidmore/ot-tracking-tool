# OT Tracking Tool

A comprehensive web application for occupational therapists to track patient progress, assessments, goals, and therapy sessions.

## Live Demo

🔗 **[https://ot-tracking-tool.web.app](https://ot-tracking-tool.web.app)**

## Features

### Patient Management ✅
- Create and manage patient profiles with demographics
- Track patient age, diagnosis, and clinical notes
- View comprehensive patient dashboards with quick stats
- Edit patient information as needed

### Program Evaluations ✅
- 17-question assessments across 4 developmental domains:
  - Play Skills
  - Self-Care Skills
  - Fine Motor Skills
  - Gross Motor Skills
- Pre and post-assessment tracking
- Save as draft or submit complete
- Automatic domain average calculations
- Progress visualization with charts

### ROM (Range of Motion) Assessments ✅
- Comprehensive joint measurement tracking
- 38 different movements across 7 body regions:
  - Shoulder, Elbow/Forearm, Wrist
  - Hip, Knee, Ankle
  - Spine (cervical and lumbar)
- Bilateral measurement support for paired joints
- Real-time percentage of normal ROM calculations
- Color-coded status indicators (normal/mild/moderate/severe)
- Regional ROM visualization

### Progress Visualization ✅
- **Program Evaluation Charts:**
  - Domain trends over time (line charts)
  - Pre vs Post comparison (bar charts)
  - Improvement analysis with metrics
  - Summary statistics

- **ROM Progress Charts:**
  - Overall ROM timeline tracking
  - Radar charts showing ROM by body region
  - Pre vs Post regional comparison
  - Improvement metrics and percentages

### Goal Tracking ✅
- Create treatment goals with categories:
  - Functional Skills, Motor Skills
  - Cognitive Skills, Social/Behavioral
  - Self-Care, Other
- Set measurable objectives and target dates
- Track progress with visual progress bars (0-100%)
- Monitor goal status (Active, Achieved, Modified, Discontinued)
- View active goals and achievement statistics

### Session Notes ✅
- Document therapy sessions with structured fields:
  - Session date and duration
  - Session focus and activities
  - Observations and performance notes
  - Progress toward goals
  - Next steps planning
- Track attendance status:
  - Completed, Cancelled, No Show, Rescheduled
- View total session time and completion statistics
- Edit and update session notes as needed

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Firebase
  - Authentication (Email/Password)
  - Firestore (NoSQL Database)
  - Hosting
- **Routing**: React Router v6
- **Charts**: Recharts for data visualization
- **Styling**: CSS Modules with responsive design

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
│   ├── components/           # React components
│   │   ├── AssessmentForm.jsx     # Program evaluation form
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Goals.jsx              # Goal tracking
│   │   ├── Login.jsx              # Authentication
│   │   ├── PatientProfile.jsx     # Patient details
│   │   ├── Patients.jsx           # Patient list
│   │   ├── ProgressCharts.jsx     # Program eval charts
│   │   ├── ROMAssessmentForm.jsx  # ROM assessment form
│   │   ├── ROMProgressCharts.jsx  # ROM visualization
│   │   └── SessionNotes.jsx       # Session documentation
│   ├── contexts/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── data/
│   │   ├── assessmentQuestions.js # Program eval questions
│   │   └── romQuestions.js        # ROM measurements
│   ├── firebase.js           # Firebase configuration
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── dist/                    # Production build
├── .env                     # Environment variables
├── firebase.json            # Firebase configuration
├── firestore.rules          # Security rules
└── README.md
```

## Data Structure

The application uses the following Firestore collections:
- `users` - User profiles and authentication data
- `patients` - Patient demographic information
- `assessments` - Program evaluation assessments
- `romAssessments` - Range of motion assessments
- `goals` - Treatment goals and progress tracking
- `sessionNotes` - Therapy session documentation

## Security

- User authentication required for all features
- Firestore security rules ensure users only access their own data
- All patient data is private and isolated per therapist
- Environment variables protect sensitive Firebase configuration

## Development Timeline

The application was built in systematic sprints:

1. **Sprint 1:** Authentication and basic setup
2. **Sprint 2:** Patient management system
3. **Sprint 3:** Program evaluation assessments
4. **Sprint 4:** Progress visualization with charts
5. **Sprint 5:** ROM assessment implementation
6. **Sprint 6:** ROM assessment visualization
7. **Sprint 7:** Goal tracking system
8. **Sprint 8:** Session notes documentation
9. **Sprint 10:** Dashboard and reporting enhancements
10. **Sprint 11:** Final polish and UX improvements

## Future Enhancements

- Media upload (photos/videos) for progress documentation
- PDF report generation
- Practice-level analytics dashboard
- Team collaboration features
- Mobile app version
- Appointment scheduling
- Billing and insurance tracking

## Author

A.J. Skidmore

## License

This project is developed for educational and professional use.

---

Built with ❤️ for occupational therapists using Claude Code
