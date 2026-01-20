# Activity 7 — Task Management System

A full-stack Task Management application designed to help users organize, track, and manage their daily tasks efficiently. This project features a RESTful API backend and a responsive frontend interface, supporting full CRUD (Create, Read, Update, Delete) operations.

## Features

- **Task Management**: Create, read, update, and delete tasks.
- **Status Tracking**: Mark tasks as pending, in-progress, or completed.
- **Data Persistence**: Tasks are stored securely in a database.
- **Responsive Design**: User-friendly interface adaptable to different screen sizes.
- **REST API**: specific endpoints for managing task resources.

## Project Structure

```text
task-management-app/
│
├── task-management-backend/   # Backend Server (API)
│   ├── src/
│   │   ├── tasks/             # Task resource module
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                   # Environment variables
│   └── package.json
│
├── task-management-frontend/  # Frontend Application (UI)
│   ├── src/
│   │   ├── components/        # UI Components
│   │   ├── services/          # API integration services
│   │   └── App.js
│   ├── public/
│   └── package.json
│
└── README.md
Technologies Used
Frontend
Framework: React

HTTP Client: Axios (for API requests)

Styling: CSS / Tailwind CSS

Backend
Framework: NestJS / Node.js

Database: MongoDB (via Mongoose)

API Documentation: Swagger (optional)

Setup Instructions
Backend Setup
Navigate to the backend directory:

Bash

cd task-management-backend
Install dependencies:

Bash

npm install
Configure Environment Variables: Create a .env file in the task-management-backend directory and add your database configuration:

Code snippet

MONGO_URI=mongodb://localhost:27017/task-management
PORT=3000
Start the server:

Bash

npm run start:dev
The backend API will run on http://localhost:3000.

Frontend Setup
Navigate to the frontend directory:

Bash

cd task-management-frontend
Install dependencies:

Bash

npm install
Start the application:

Bash

npm start
or if using Vite:

Bash

npm run dev
The application will run on http://localhost:5173 (or http://localhost:3000 depending on configuration).

API Endpoints
GET /tasks - Retrieve all tasks

POST /tasks - Create a new task

GET /tasks/:id - Retrieve a specific task

PATCH /tasks/:id/status - Update task status

DELETE /tasks/:id - Delete a task