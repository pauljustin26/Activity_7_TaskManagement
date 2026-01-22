# Activity 7: Task Management System

This project is a full-stack task management application designed to organize projects, track tasks, and manage team members efficiently. It consists of a React-based frontend and a NestJS backend API.

## 📂 Project Directory Structure

The project is organized into two main directories:

```text
Activity_7_TaskManagement/
├── task-management-backend/   # Backend API (NestJS)
│   ├── src/
│   │   ├── projects/          # Project management module
│   │   ├── tasks/             # Task management module
│   │   ├── users/             # User management module
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
└── task-management-frontend/  # Client Application (React + Vite)
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── context/           # AuthContext for state management
    │   ├── pages/             # Dashboard, Login, ProjectDetails, Users
    │   ├── App.jsx            # Main Router & Layout
    │   ├── api.js             # Axios setup
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
🚀 Technologies Used
Frontend (task-management-frontend)
Framework: React (v19) with Vite

Routing: React Router DOM (v7)

Styling: Tailwind CSS (v4)

HTTP Client: Axios

Utilities: React Datepicker

Backend (task-management-backend)
Framework: NestJS (v11)

Database: MongoDB with Mongoose

Validation: Class-validator & Class-transformer

Language: TypeScript

🛠️ Getting Started
Follow these steps to set up and run the project locally.

Prerequisites
Node.js installed

MongoDB installed and running locally (Default URI: mongodb://localhost/task-management-db)

1. Backend Setup
Navigate to the backend directory, install dependencies, and start the server.

Bash

cd task-management-backend
npm install
npm run start:dev
The backend server typically runs on http://localhost:3000.

2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the development server.

Bash

cd task-management-frontend
npm install
npm run dev
✨ Features
Authentication: Secure Login and Registration for users.

Role-Based Access: Protected routes ensuring only authenticated users can access the dashboard.

Dashboard: Overview of projects and tasks.

Project Management: Create and view specific project details (Tasks within projects).

Team Management: View and manage users/team members.

Task Tracking: Organize tasks with status updates.