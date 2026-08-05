# CRM System

A modern Customer Relationship Management (CRM) system built using **Next.js** for the frontend and **Django REST Framework** for the backend. The application follows a RESTful architecture with JWT-based authentication and a modular codebase to support scalable CRM features.

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Django
- Django REST Framework
- Simple JWT Authentication
- SQLite (Development)

## Development Tools

- Git
- GitHub
- Postman
- VS Code

---

# Project Structure

```
crm-system/
│
├── backend/
│   ├── core/
│   ├── users/
│   ├── dashboard/
│   └── manage.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── services/
│   └── public/
│
└── README.md
```

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Access Token
- Refresh Token
- Protected API Endpoints
- Persistent User Session
- Logout Functionality

---

## Dashboard

- Dashboard Summary API
- JWT Protected Endpoint
- Dashboard Statistics
- Serializer-Based Response
- RESTful API Design

---

# API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/register/` |
| POST | `/api/auth/login/` |
| POST | `/api/auth/refresh/` |
| POST | `/api/auth/verify/` |

---

## Dashboard

| Method | Endpoint | Authentication |
|---------|----------|----------------|
| GET | `/api/dashboard/` | Required |

---

# Sample Dashboard Response

```json
{
    "total_customers": 125,
    "total_leads": 64,
    "opportunities": 18,
    "revenue": "24500.00",
    "tasks_due": 9
}
```

---

# Authentication

Protected endpoints require a JWT access token.

Example:

```
Authorization: Bearer <access_token>
```

---

# Backend Modules

```
backend/
│
├── core/
│
├── users/
│   ├── authentication.py
│   ├── serializers.py
│   ├── views.py
│   └── models.py
│
├── dashboard/
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests.py
```

---

# Frontend Modules

```
frontend/
│
├── app/
│
├── components/
│   ├── Navbar
│   ├── Sidebar
│   └── Dashboard
│
├── context/
│   └── AuthContext
│
├── services/
│   └── API Services
```

---

# Authentication Flow

1. User submits login credentials.
2. Backend validates the credentials.
3. JWT Access and Refresh tokens are generated.
4. Tokens are stored on the client.
5. Protected API requests include the Access Token.
6. Unauthorized requests return **401 Unauthorized**.

---

# Running the Project

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000/
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:3000/
```

---

# Testing

The project includes API testing for:

- Authentication
- JWT Authorization
- Dashboard API
- Protected Routes
- Serializer Validation

---

# Future Modules

- Customer Management
- Lead Management
- Sales Pipeline
- Opportunity Management
- Contact Management
- Company Management
- Task Management
- Reports & Analytics
- Notifications
- Role-Based Access Control (RBAC)
- Settings
- Admin Panel

---

# License

This project is developed for educational and internship purposes.