Task Management System

Task Managemer created using ReactJS for frontend, NodeJS/Express for backend, and MySQL for database


Technical Stack

* Frontend: React (Vite environment), JavaScript, CSS3
* Backend: Node.js, Express framework
* Database: MySQL (managed via phpMyAdmin)

Directory Architecture

```text
taskmanager-project/
├── .gitignore             # Environment and dependency exclusion rules
├── README.md              # Project documentation
├── backend/               # Server-side application layer
│   ├── package.json       # Backend dependency manifest
│   ├── schema.sql         # Local database structural blueprint
│   └── server.js          # Entry point for Express application and database connectivity
└── frontend/              # Client-side application layer
    ├── package.json       # Frontend dependency manifest
    └── src/               # Application source files

System Configuration and Local Deployment

To run this application locally, ensure you have Node.js and a local server environment (such as XAMPP) installed, then execute the following procedural phases.

Database Initialization

Access your local phpMyAdmin control panel at http://localhost/phpmyadmin/

Instantiate a new database named exactly: task_manager_db

Navigate to the Import tab panel.

Select the Choose File option and locate backend/schema.sql within this repository workspace.

Execute the execution script (Go/Import button) to automatically instantiate the relational table structures.

Dependencies

 Configure server dependencies
cd backend
npm install

 Configure client dependencies
cd ../frontend
npm install

To execute

Open 2 terminals, 1 for backend and 1 for frontend

Backend terminal
cd backend
node server.js

Frontend terminal
cd frontend
npm run dev

Once both runtimes are fully active, launch your web browser and navigate to the address specified in the frontend execution terminal (typically http://localhost:5173) to operate the task management engine dashboard interface.

This system is consisted of the following core functions:

Add task
Delete Task
Edit Task
Filter Task
 -Date
 -Status
Search Task