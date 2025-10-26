
# 🧠 HR Analytics Frontend (Next.js 15)

A modern, intuitive frontend built with **Next.js 15** for predicting and analyzing **employee attrition** using machine learning insights served by the FastAPI backend.

---

## 🚀 Overview

This frontend provides:
- A **clean, responsive interface** for HR managers.
- **Interactive dashboards** showing attrition trends and predictions.
- **Simple employee data forms** for running predictions.
- **Authentication and RBAC** (login/logout, roles: Admin, HR, Viewer).
- Integration with a **FastAPI backend** for data, analytics, and predictions.

---

## 🧩 Tech Stack

| Layer | Technology |
|--------|-------------|
| Framework | [Next.js 13](https://nextjs.org/) |
| Styling | Tailwind CSS |
| Charts | Recharts / Chart.js |
| Auth | JWT (via FastAPI backend) |
| API | REST (Axios) |
| State Mgmt | React Context / Zustand |
| Routing | Next.js App Router |

---

## ⚙️ Project Structure

```

frontend/
├── app/
│   ├── layout.tsx           # Base layout with navigation
│   ├── page.tsx             # Dashboard / Overview
│   ├── login/page.tsx       # Login page
│   ├── employees/
│   │   ├── page.tsx         # Employee list + search
│   │   ├── [id]/page.tsx    # Single employee details
│   ├── predict/page.tsx     # Prediction form
│   ├── analytics/page.tsx   # Charts & metrics
│   ├── settings/page.tsx    # Profile + role management
│
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── EmployeeCard.tsx
│   ├── PredictionForm.tsx
│   ├── ChartCard.tsx
│
├── lib/
│   ├── api.ts               # Axios instance & endpoints
│   ├── auth.ts              # Token helpers (login/logout)
│   ├── store.ts             # Zustand store
│
├── public/
│   ├── logo.svg
│   ├── avatars/
│
├── styles/
│   ├── globals.css
│
└── README.md

````

---

## 🔧 Setup & Installation

### 1️⃣ Clone the repo
```bash
git clone <your-repo-url>
cd frontend
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 4️⃣ Run development server

```bash
npm run dev
```

The app will start on
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔒 Authentication

The app communicates with the FastAPI backend using JWT tokens:

* On login, the backend issues a token.
* The token is stored in browser storage.
* All API requests automatically attach it via the Axios instance.

RBAC roles available:

* **Admin:** Full access to users, analytics, and predictions.
* **HR:** Can manage employees and view predictions.
* **Viewer:** Read-only dashboard view.

---

## 📊 Pages & Features

| Page               | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| **Dashboard**      | Overview of attrition metrics and live analytics               |
| **Login / Logout** | JWT authentication flow                                        |
| **Employees**      | View, search, and manage employees                             |
| **Predict**        | Input employee details and get attrition risk prediction       |
| **Analytics**      | Visualized data from FastAPI (retention, income, satisfaction) |
| **Settings**       | Manage profile and roles (Admin only)                          |

---

## 🧠 Connecting to the Backend

Ensure your FastAPI backend is running at:

```
http://127.0.0.1:8000
```

Test connection:

```bash
curl http://127.0.0.1:8000/health
```

If it returns `{ "status": "ok" }`, the backend is ready.

---

## 🧪 Testing

You can add frontend integration tests using:

```bash
npm run test
```

