# CRM System

A modern **Customer Relationship Management (CRM)** system built using **Next.js** for the frontend and **Django REST Framework** for the backend. The application follows a RESTful architecture with JWT-based authentication and a modular codebase to support scalable CRM features.

---

# 🚀 Project Status

**Current Progress:** ✅ **Day 7 Completed**

## Completed Modules

- ✅ Authentication
- ✅ Dashboard
- ✅ Customer Management
- ✅ Lead Management
- ✅ Deal Management
- ✅ Sales Pipeline Analytics APIs
- ✅ Opportunity Management UI
- ✅ Contact Management UI
- ✅ Company Management UI
- 🟡 Dashboard API Integration (Partial)

---

# 🛠 Tech Stack

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
- Visual Studio Code

---

# 📁 Project Structure

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
│   ├── pipeline/
│   └── manage.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   └── public/
│
└── README.md
```

---

# ✨ Features

## 🔐 Authentication

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

# 📊 Dashboard

## Completed

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

## In Progress

- Sales Overview
- Lead Sources
- Deals Pipeline Analytics
- Recent Activities
- Top Performers

---

# 👥 Customer Management

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

# 🎯 Lead Management

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

# 💼 Deal Management

## Backend

### CRUD Features

- Deal Model
- Deal Serializer
- Create Deal
- Update Deal
- Delete Deal
- Get Deal by ID
- Get All Deals
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

# 📈 Sales Pipeline Analytics

## Backend

### Completed APIs

#### Pipeline Summary API

Returns:

- Total Deals
- Total Pipeline Value
- Active Deals
- Closed Won
- Closed Lost

#### Stage Distribution API

Returns:

- Pipeline Stage
- Deal Count
- Total Value
- Percentage Distribution

#### Recent Deals API

Returns:

- Customer
- Company
- Deal Value
- Pipeline Stage
- Expected Closing Date

#### Pipeline Performance API

Returns Monthly Analytics:

- Deals Created
- Deals Closed
- Revenue Generated

#### Pipeline Trend Comparison API

Provides:

- Current Month Statistics
- Previous Month Statistics
- Growth Percentage

#### Pipeline Export API

Supports:

- CSV Export
- Excel Export
- PDF Export

#### Stage Drill-down API

Returns all deals belonging to a selected pipeline stage.

### Features

- Date Range Filtering
- Monthly Analytics
- Yearly Analytics
- Aggregation Queries
- JWT Authentication
- Serializer Validation
- Live Database Data
- RESTful API Design
- Postman API Testing

---

# 💡 Opportunity Management

## Frontend

- Opportunity Listing
- Add Opportunity
- Edit Opportunity
- Opportunity Details
- Responsive Design
- Form Validation
- Loading States

---

# 📇 Contact Management

## Frontend

- Contact Listing
- Add Contact
- Edit Contact
- Contact Details
- Search
- Filtering
- Responsive Design
- Validation

---

# 🏢 Company Management

## Frontend

- Company Listing
- Add Company
- Edit Company
- Company Details
- Search Companies
- Company Filters
- Pagination
- Responsive Design
- Loading States
- Client-side Validation

---

# 🌐 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/register/` |
| POST | `/api/auth/login/` |
| POST | `/api/auth/refresh/` |
| POST | `/api/auth/verify/` |

---

## Dashboard

| Method | Endpoint |
|---------|----------|
| GET | `/api/dashboard-summary/` |

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

## Sales Pipeline

| Method | Endpoint |
|---------|----------|
| GET | `/api/pipeline/summary/` |
| GET | `/api/pipeline/stages/` |
| GET | `/api/pipeline/recent-deals/` |
| GET | `/api/pipeline/performance/` |
| GET | `/api/pipeline/trends/` |
| GET | `/api/pipeline/export/` |
| GET | `/api/pipeline/stages/{stage}/deals/` |

---

# 🔒 Authentication

Protected endpoints require a JWT Access Token.

Example:

```text
Authorization: Bearer <access_token>
```

---

# 📦 Backend Modules

```text
backend/

├── core/
├── users/
├── dashboard/
├── customers/
├── leads/
├── deals/
├── pipeline/
```

---

# 🎨 Frontend Modules

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
│   ├── Sales Pipeline
│   ├── Opportunities
│   ├── Contacts
│   └── Company Management
│
├── context/
│   └── AuthContext
│
├── hooks/
│
├── services/
│   └── API Services
```

---

# 🔄 Authentication Flow

1. User submits login credentials.
2. Backend validates the credentials.
3. JWT Access and Refresh tokens are generated.
4. Tokens are stored securely.
5. Protected API requests include the Access Token.
6. Unauthorized requests return **401 Unauthorized**.
7. Refresh token is used to obtain a new access token when required.

---

# ▶️ Running the Project

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

# 🧪 Testing

API testing completed using **Postman**.

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

### Sales Pipeline APIs

- Pipeline Summary API
- Stage Distribution API
- Recent Deals API
- Pipeline Performance API
- Pipeline Trends API
- Pipeline Export API
- Stage Drill-down API
- JWT Authentication
- Date Filters
- Response Validation

---

# 📅 Development Progress

## Day 1

- Project Setup
- Authentication Module
- JWT Configuration

## Day 2

### Backend

- Customer CRUD APIs

## Day 3

### Frontend

- Customer Management UI
- Dashboard UI

## Day 4

### Backend

- Dashboard APIs

### Integration

- Customer Module Integration

## Day 5

### Backend

- Lead CRUD APIs
- Dashboard Statistics APIs

### Frontend

- Customer Forms
- Customer Details
- Lead Management UI

### Integration

- Dashboard Statistics Integration

## Day 6

### Backend

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

## Day 7

### Backend

- Sales Pipeline Summary API
- Stage Distribution API
- Recent Deals API
- Pipeline Performance API
- Pipeline Trends API
- Pipeline Export API
- Stage Drill-down API
- Date Filters
- Aggregation Queries
- JWT Authentication
- Serializer Validation
- API Validation
- Backend Debugging
- Postman Testing

### Frontend

- Sales Pipeline UI Improvements
- Company Management UI
- Dashboard Cards Review
- Leads Page UI Improvements
- Navigation Bar Review

### Integration

- Backend API Preparation
- API Contract Review
- Frontend Integration Support

---

# 📌 Current Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Completed |
| Dashboard UI | ✅ Completed |
| Dashboard APIs | 🟡 In Progress |
| Customers | ✅ Completed |
| Leads | ✅ Completed |
| Deals | ✅ Completed |
| Sales Pipeline APIs | ✅ Completed |
| Opportunity UI | ✅ Completed |
| Contact UI | ✅ Completed |
| Company Management UI | ✅ Completed |
| Dashboard Integration | 🟡 In Progress |

---

# 🚀 Future Modules

- Opportunity Backend
- Company Backend
- Contact Backend
- Task Management
- Reports & Analytics
- Notifications
- Role-Based Access Control (RBAC)
- Settings
- Admin Panel

---

# 🌿 Git Workflow

- Feature Branch Development
- Pull Requests
- Code Reviews
- Merge into Develop Branch

---

# 📂 Repository

**GitHub Repository**

```
https://github.com/UnzaShaikh/crm-system
```

---

# 📄 License

This project is developed as part of the **SoftiqTech Internship Program** for educational and internship purposes.
