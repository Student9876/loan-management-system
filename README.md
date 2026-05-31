# Enterprise Loan Management System

A full-stack lending platform where borrowers apply for loans and internal executives manage those loans through their lifecycle. The system is divided into two main parts: a multi-step Borrower Portal and a role-guarded Operations Dashboard.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query.
- Backend: Node.js, Express.js, TypeScript.
- Database: MongoDB and Mongoose.
- Authentication: JWT and bcrypt for secure password hashing.

## Key Features

- Borrower Flow: Multi-step application including personal details, a strict server-side Business Rule Engine (BRE) eligibility check, salary slip uploads (PDF/JPG/PNG, max 5MB), and a dynamic loan configuration slider using Simple Interest calculations.
- Operations Dashboard: Stage-specific modules for Sales (lead tracking), Sanction (approval/rejection), Disbursement (fund release), and Collection (payment recording with global UTR uniqueness).
- Strict RBAC: Role-Based Access Control enforced on both frontend views and backend API routes. Each executive role can access only their own module, while the Admin sees all.

---

## Local Setup Instructions

### 1. Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v18 or higher)
- npm, pnpm, or yarn
- MongoDB (local instance or MongoDB Atlas URI)
- Cloudinary account (for salary slip uploads)

### 2. Clone the Repository

```bash
git clone https://github.com/Student9876/loan-management-system.git
cd loan-management-system
```

### 3. Environment Variables

The repository contains a `.env.example` file. You must create a `.env` file in both the `client` and `server` directories based on these examples.

Server (`server/.env`):

```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Client (`client/.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies

Open two terminal windows to install dependencies for both the frontend and backend.

Terminal 1 (Backend):

```bash
cd server
npm install
```

Terminal 2 (Frontend):

```bash
cd client
npm install
```

### 5. Database Seeding (Crucial for Evaluation)

To make testing seamless, the system includes a seed script that pre-creates one account per role with known credentials so the evaluator can log in and test each role immediately.

In the `server` terminal, run:

```bash
npm run seed
```

(Note: Running this will clear existing users and loans to reset the environment.)

### 6. Run the Application

Start the development servers.

Terminal 1 (Backend):

```bash
npm run dev
```

Terminal 2 (Frontend):

```bash
npm run dev
```

The application will now be running at `http://localhost:3000`.

## Evaluator Credentials

Use the following pre-created accounts to immediately test the system's Role-Based Access Control and dashboard modules. All passwords are set to `Test@1234`.

| Role | Email Address | Access Scope |
| --- | --- | --- |
| System Admin | admin@lms.com | Access to all dashboard modules. |
| Sales | sales@lms.com | Pre-application lead tracking only. |
| Sanction | sanction@lms.com | Application review and approval/rejection only. |
| Disbursement | disbursement@lms.com | Fund release tracking only. |
| Collection | collection@lms.com | Payment tracking and loan closure only. |
| Borrower | borrower@lms.com | Borrower application portal only. |

## Walkthrough Video
