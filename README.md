# 🏛️ Samadhan Portal

**Public Grievance & Local Issue Reporting System**

An official digital platform developed to streamline the reporting and resolution of civic issues within the community. The portal enables citizens to register complaints related to roads, water supply, streetlights, sanitation, and other public services through a transparent and accountable workflow.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Firebase](https://img.shields.io/badge/Firebase-v10-orange)]()
[![React](https://img.shields.io/badge/React-18-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Firebase Configuration](#firebase-configuration)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

Samadhan Portal envisions a responsive, transparent, and technology-driven governance model. By integrating modern digital tools into civic management, the portal aims to create cleaner, safer, and more organized cities. It serves as a step toward building a smarter urban ecosystem where citizen feedback directly contributes to continuous improvement.

### Purpose

- **Centralized Mechanism**: Create an efficient system for grievance reporting
- **Eliminate Delays**: Replace manual complaint handling with instant digital submission
- **Enhance Transparency**: Provide complete visibility into issue status and resolution
- **Data-Driven Governance**: Enable analytical insights for better resource allocation

---

## ✨ Features

### For Citizens
- 📸 **Easy Reporting** - Snap a photo and submit issue reports in under a minute
- 🔍 **Real-time Tracking** - Monitor complaint status from submission to resolution
- 🖼️ **Image Upload** - Attach photos (Base64 encoded, max 800KB) to complaints
- 🗑️ **Manage Complaints** - View and delete your reported issues
- 📊 **Dashboard** - Personal dashboard showing all your complaints

### For Workers
- 📋 **Task Management** - View all assigned issues
- 🔄 **Status Updates** - Update issue status (Pending → In-Progress → Completed)
- 📤 **Proof Upload** - Submit proof of completion with images
- ⏱️ **Workflow Tracking** - Monitor your task completion rate

### For Administrators
- 👥 **User Management** - Create and manage worker accounts
- 🎯 **Issue Assignment** - Assign complaints to appropriate field workers
- 📈 **Analytics Dashboard** - View statistics and performance metrics
- 🔍 **Complete Oversight** - Monitor all issues across the system
- 📊 **Data-Driven Insights** - Heatmaps, trends, and performance reports

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

### Backend & Services
- **Firebase Authentication** - User authentication and authorization
- **Cloud Firestore** - NoSQL database for storing issues and user data
- **Firebase Storage** - File storage for proof images (workers)
- **Firebase Hosting** - Static site hosting (for deployment)

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/samadhan-portal.git
   cd samadhan-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   Update `src/firebase/config.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

4. **Set up Firestore Security Rules**
   
   Deploy the rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Set up Storage Security Rules**
   
   Deploy the rules from `storage.rules`:
   ```bash
   firebase deploy --only storage:rules
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
samadhan-portal/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navbar and footer
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context provider
│   ├── firebase/
│   │   └── config.js           # Firebase configuration
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Citizen/
│   │   │   ├── Dashboard.jsx   # Citizen dashboard
│   │   │   └── ReportIssue.jsx # Issue reporting form
│   │   ├── Worker/
│   │   │   └── Dashboard.jsx   # Worker dashboard
│   │   └── Admin/
│   │       └── Dashboard.jsx   # Admin dashboard
│   ├── App.jsx                 # Main app component with routing
│   ├── index.css               # Global styles and Tailwind imports
│   └── main.jsx                # Application entry point
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

---

## 👥 User Roles

### 1. Citizen (Default)
- Register and login to the portal
- Report civic issues with photos
- Track status of reported issues
- Delete their own complaints
- View personal dashboard

### 2. Worker
- View assigned tasks/issues
- Update issue status
- Upload proof of completion
- Monitor task progress

### 3. Admin
- View all issues in the system
- Assign issues to workers
- Create new worker accounts
- Access analytics and statistics
- Monitor overall system performance

**Note**: To create admin/worker accounts:
1. Register as a citizen
2. Manually update the `role` field in Firestore Users collection
3. Or use admin panel to create worker accounts

---

## 🔥 Firebase Configuration

### Firestore Collections

#### `users`
```javascript
{
  uid: "user-unique-id",
  email: "user@example.com",
  name: "User Name",
  role: "citizen" | "worker" | "admin",
  createdAt: "2024-12-06T00:00:00.000Z"
}
```

#### `issues`
```javascript
{
  userId: "user-id",
  userEmail: "user@example.com",
  title: "Issue title",
  description: "Detailed description",
  category: "Road | Street Light | Garbage | Water | Electricity | Other",
  imageUrl: "data:image/jpeg;base64,...",  // Base64 encoded image
  status: "Pending | In-Progress | Completed",
  assignedTo: "worker-id" | null,
  createdAt: "2024-12-06T00:00:00.000Z",
  completedAt: "2024-12-06T00:00:00.000Z",  // Optional
  completedImageUrl: "https://..."           // Optional, for worker proof
}
```

### Storage Structure
```
uploads/
├── completed/
│   └── {issueId}/
│       └── {timestamp}_{filename}
└── issues/
    └── {userId}/
        └── {timestamp}_{filename}
```

---

## 📜 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🌐 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Environment Variables (Optional)

For production, consider using environment variables:

Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Update `src/firebase/config.js` to use environment variables.

---

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb`
- **Secondary Cyan**: `#06b6d4`
- **Success Green**: `#10b981`
- **Warning Yellow**: `#f59e0b`
- **Error Red**: `#ef4444`
- **Background**: Slate variations

### Typography
- **Font Family**: 'Outfit' (Google Fonts)
- **Headings**: Bold, extrabold weights
- **Body**: Regular weight, comfortable line-height

---

## 🔒 Security Considerations

### Current Rules (Development)
The current Firestore and Storage rules allow authenticated users full access. These are suitable for development.

### Production Recommendations

**Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'worker']);
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint rules
- Use meaningful variable and function names
- Write descriptive commit messages
- Add comments for complex logic

---

## 🐛 Known Issues & Limitations

- Image uploads limited to 800KB due to Firestore document size constraints
- No password reset functionality yet
- No email verification on registration
- Delete operation has no undo/confirmation
- Mobile optimization needs further testing

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

For questions, issues, or suggestions:
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/samadhan-portal/issues)
- **Email**: support@samadhanportal.gov.in (if available)

---

## 🙏 Acknowledgments

- Government of India for the initiative
- Firebase for backend infrastructure
- React community for excellent documentation
- Tailwind CSS for the utility-first framework
- Lucide for beautiful icons

---

## 📊 Project Stats

- **Bundle Size**: 675 KB (206 KB gzipped)
- **Build Time**: ~5 seconds
- **Dependencies**: 15+ packages
- **Lines of Code**: 2,000+
- **Components**: 10+ React components

---

**Built with ❤️ for better civic governance**

*Samadhan Portal - Empowering Citizens, Enabling Transparency*
