# Support Hub: Professional Kanban & Analytics 🚀

Welcome to the **Support Hub**, a modern, full-stack Customer Success and Project Management platform. This project has been designed as an educational resource for BCA students to study Full-Stack Development using **Next.js**, **Prisma**, and **MongoDB**.

## 🎯 Educational Goals
This project demonstrates industry-standard practices in:
1.  **Framework Architecture**: Using Next.js App Router for server-side rendering and API handling.
2.  **ORM Implementation**: Managing data with Prisma and handling non-replica set MongoDB environments.
3.  **Modern UI/UX**: Implementing **Glassmorphism**, interactive charts with **Recharts**, and fluid animations with **Framer-Motion**.
4.  **Security**: JWT-based authentication using the `jose` library.

---

## 🏗️ Technology Stack
*   **Frontend**: Next.js 15+, Tailwind CSS, Framer Motion.
*   **Analytics**: Recharts (Pie & Area charts).
*   **Backend**: Next.js Server Actions & API Routes.
*   **Database**: MongoDB with Prisma ORM.
*   **Authentication**: Custom JWT Middleware.

---

## 🛠️ Local Setup Guide
To run this project on your own machine, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Shree222Hema/support-hub.git

# Navigate into the project
cd support-hub

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add:
```env
DATABASE_URL="mongodb://127.0.0.1:27017/support_hub"
AUTH_SECRET="your_very_long_random_secret_string"
AUTH_EMAIL="test@example.com"
AUTH_PASSWORD="password123"
```

### 4. Database Setup
```bash
# Generate the Prisma Client
npx prisma generate
```

### 5. Start the Server
```bash
npm run dev
```
Visit `http://localhost:3000` to see the result!

---

## 📂 Key File Breakdown (For Students)
- `src/app/dashboard/page.tsx`: The "Pro-Vision" dashboard UI and analytics fetching.
- `src/app/dashboard/kanban/page.tsx`: Real-time task management logic.
- `src/lib/auth-utils.ts`: JWT signing and token verification utilities.
- `src/app/api/`: Backend API routes handling CRUD operations.

---

## 📝 License
This project is for educational purposes. Feel free to use it for your BCA projects and study!

*Created with ❤️ for BCA Students.*
