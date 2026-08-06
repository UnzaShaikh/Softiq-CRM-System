# CRM System

A modern **Customer Relationship Management (CRM)** system built using **Next.js** for the frontend and **Django REST Framework** for the backend. The application follows a RESTful architecture with JWT-based authentication and a modular codebase to support scalable CRM features.

---

# Project Status

**Current Progress:** ✅ Day 6 Completed

Completed Modules

- Authentication
- Dashboard
- Customer Management
- Lead Management
- Deal / Sales Pipeline Management
- Opportunity Management UI
- Contact Management UI
- Dashboard API Integration (Partial)

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Context API

## Backend

- Django
- Django REST Framework
- Simple JWT Authentication
- PostgreSQL (Neon Database)
- Django Filters

## Development Tools

- Git
- GitHub
- Postman
- VS Code

---

# Project Structure

```text
crm-system/
│
├── backend/
│   ├── core/
│   ├── users/
│   ├── customers/
│   ├── leads/
│   ├── deals/
│   ├── dashboard/
│   └── manage.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── services/
│   ├── hooks/
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
- Protected Routes
- Persistent User Session
- Logout Functionality

---

## Dashboard

### Completed

- Dashboard Summary API
- JWT Protected Endpoint
- Dashboard Statistics
- Serializer-Based Response
- RESTful API Design
- Total Customers
- Active Customers
- Total Deals
- Total Revenue
- Recent Customers
- Recent Leads

### In Progress

- Sales Overview
- Lead Sources
- Deals Pipeline Analytics
- Recent Activities
- Top Performers

---

# Customer Management

## Backend

- Customer Model
- CRUD APIs
- Search
- Filtering
- Ordering
- Pagination
- JWT Authentication
- Validation

## Frontend

- Customer Listing
- Add Customer
- Edit Customer
- Customer Details
- Search
- Filters
- Responsive Design
- Loading States
- Form Validation

---

# Lead Management

## Backend

- Lead Model
- CRUD APIs
- Search
- Filtering
- Ordering
- Pagination
- JWT Authentication
- Serializer Validation

## Frontend

- Lead Listing
- Add Lead
- Edit Lead
- Lead Details
- Search
- Status Filters
- Pagination
- Responsive UI
- Action Buttons

---

# Deals / Sales Pipeline

## Backend

Completed complete Deal Management module.

### Features

- Deal Model
- Deal Serializer
- Create Deal
- Get All Deals
- Get Deal by ID
- Update Deal
- Delete Deal
- Search
- Filtering
- Ordering
- Pagination
- JWT Authentication
- Validation

### Deal Fields

- Name
- Customer
- Deal Value
- Pipeline Stage
- Probability
- Expected Close Date
- Notes
- Created By
- Created At
- Updated At

---

# Opportunity Management

## Frontend

Completed

- Opportunity Listing
- Add Opportunity
- Edit Opportunity
- Opportunity Details
- Responsive Design
- Form Validation
- Loading States

---

# Contact Management

## Frontend

Completed

- Contact Listing
- Add Contact
- Edit Contact
- Contact Details
- Search
- Filtering
- Responsive Design
- Validation

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
| GET | `/api/dashboard-summary/` | Required |

---

## Customers

| Method | Endpoint |
|---------|----------|
| POST | `/api/customers/` |
| GET | `/api/customers/` |
| GET | `/api/customers/{id}/` |
| PATCH | `/api/customers/{id}/` |
| DELETE | `/api/customers/{id}/` |

Supports:

- Search
- Filtering
- Ordering
- Pagination

---

## Leads

| Method | Endpoint |
|---------|----------|
| POST | `/api/leads/` |
| GET | `/api/leads/` |
| GET | `/api/leads/{id}/` |
| PATCH | `/api/leads/{id}/` |
| DELETE | `/api/leads/{id}/` |

Supports:

- Search
- Filtering
- Ordering
- Pagination

---

## Deals

| Method | Endpoint |
|---------|----------|
| POST | `/api/deals/` |
| GET | `/api/deals/` |
| GET | `/api/deals/{id}/` |
| PATCH | `/api/deals/{id}/` |
| DELETE | `/api/deals/{id}/` |

Supports:

- Search
- Filtering
- Ordering
- Pagination

---

# Sample Dashboard Response

```json
{
  "total_customers": 125,
  "active_customers": 64,
  "total_deals": 18,
  "total_revenue": "24500.00",
  "recent_customers": [],
  "recent_leads": []
}
```

---

# Authentication

Protected endpoints require a JWT access token.

Example:

```text
Authorization: Bearer <access_token>
```

---

# Backend Modules

```text
backend/

├── core/
├── users/
├── dashboard/
├── customers/
├── leads/
├── deals/
```

---

# Frontend Modules

```text
frontend/

├── app/
├── components/
│   ├── Navbar
│   ├── Sidebar
│   ├── Dashboard
│   ├── Customers
│   ├── Leads
│   ├── Deals
│   ├── Opportunities
│   └── Contacts
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
4. Tokens are stored securely.
5. Protected API requests include the Access Token.
6. Unauthorized requests return **401 Unauthorized**.
7. Refresh token is used to obtain a new access token when required.

---

# Running the Project

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py runserver
```

Backend runs at:

```text
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

```text
http://localhost:3000/
```

---

# Testing

API testing has been completed using **Postman**.

### Authentication

- Register
- Login
- JWT Authentication
- Refresh Token

### Customer APIs

- CRUD Operations
- Search
- Filtering
- Ordering
- Pagination

### Lead APIs

- CRUD Operations
- Search
- Filtering
- Ordering
- Pagination

### Deal APIs

- CRUD Operations
- Search
- Filtering
- Ordering
- Pagination

### Dashboard

- Dashboard Summary API
- JWT Authorization
- Serializer Validation

---

# Development Progress

## Day 1

- Project setup
- Authentication module
- JWT configuration

## Day 2

- Customer Backend
- Customer CRUD APIs

## Day 3

- Customer UI
- Dashboard UI

## Day 4

- Dashboard Backend APIs
- Customer Integration

## Day 5

Completed

- Lead Backend
- Lead CRUD APIs
- Dashboard Statistics APIs
- Customer Forms
- Customer Details
- Lead Management UI
- Dashboard Statistics Integration

## Day 6

Completed

### Backend

- Deals Module
- Deal CRUD APIs
- Search
- Filtering
- Ordering
- Pagination
- JWT Authentication
- Serializer Validation
- Complete Postman Testing

### Frontend

- Opportunity Management UI
- Contact Management UI
- Responsive Improvements
- UI Review & Enhancements

### Integration

- Dashboard Summary Integration
- JWT Authentication Fixes
- Live Database Integration

---

# Current Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Completed |
| Dashboard UI | ✅ Completed |
| Dashboard APIs | 🟡 In Progress |
| Customers | ✅ Completed |
| Leads | ✅ Completed |
| Deals | ✅ Completed |
| Opportunity UI | ✅ Completed |
| Contact UI | ✅ Completed |
| Dashboard Integration | 🟡 In Progress |

---

# Future Modules

- Opportunity Backend
- Contact Backend
- Company Management
- Task Management
- Reports & Analytics
- Notifications
- Role-Based Access Control (RBAC)
- Settings
- Admin Panel

---

# Git Workflow

- Feature Branch Development
- Pull Requests
- Code Reviews
- Merge into Develop Branch

---

# Repository

**GitHub Repository**

https://github.com/UnzaShaikh/crm-system

---

# License

This project is developed as part of the **SoftiqTech Internship Program** for educational and internship purposes.
