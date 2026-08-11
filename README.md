# CRM System

A modern **Customer Relationship Management (CRM)** system built using **Next.js** for the frontend and **Django REST Framework** for the backend. The application follows a RESTful architecture with JWT-based authentication and a modular codebase to support scalable CRM features.

---

# 🚀 Project Status

**Current Progress:** 🟢 **Day 11 Completed**

## Completed Modules

- ✅ Authentication
- ✅ Dashboard
- ✅ Customer Management
- ✅ Lead Management
- ✅ Deal Management
- ✅ Sales Pipeline Analytics APIs
- ✅ Sales Pipeline UI
- ✅ Sales Pipeline Integration
- ✅ Opportunity Management UI
- ✅ Opportunity CRUD APIs
- ✅ Opportunity Analytics & Supporting APIs
- ✅ Contact Management UI
- ✅ Contact Backend APIs
- ✅ Contact API Integration
- ✅ Follow-ups UI
- ✅ Company Management UI
- ✅ Company CRUD APIs
- ✅ Company Search, Filtering & Supporting APIs
- ✅ Email Templates UI
- 🟡 Task Management UI
- 🟡 Company API Integration
- 🟡 Dashboard API Integration (Partial)
- ✅ Reports & Analytics UI
- ✅ Revenue Module UI
- ✅ Activity CRUD APIs
- ✅ Activity Search, Filtering & Supporting APIs
- ✅ Notes APIs

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


# 📅 Follow-ups Management

## Frontend

- Follow-ups Listing UI
- Follow-up Overview Cards
- Total Follow-ups
- Upcoming Follow-ups
- Completed Follow-ups
- Overdue Follow-ups
- Conversion Rate
- Create Follow-up UI
- Search and Filters
- Type, Status, Priority, and Date Range Filters
- Follow-up Table
- View, Edit, and Delete Actions
- Pagination
- Upcoming Reminders
- Follow-up Insights
- Responsive Design
- UI/UX Consistency

# 🏢 Company Management

## Backend

### Company CRUD APIs

- Company Model
- Company Serializer
- Create Company
- Get All Companies
- Get Company by ID
- Update Company
- Delete Company
- Field Validation
- JWT Authentication
- Database Relationships
- API Error Handling
- Optimized Database Queries

### Company Search, Filtering & Supporting APIs

- Search Companies
- Industry Filtering
- Company Size Filtering
- Status Filtering
- Pagination
- Ordering
- Total Records Count
- Industry Options
- Company Size Options
- Company Status Options
- Serializer Validation
- JWT Authentication
- Postman API Testing
- Backend Test Cases

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

# 📧 Email Templates Management

## Frontend

- Email Templates Listing UI
- Template Search
- Pagination
- Create Email Template UI
- Email Content Editor
- Variable Insertion
- Category and Template Type
- Active/Inactive Status
- Email Preview
- View Email Template UI
- Edit and Duplicate Actions
- Delete Confirmation Popup
- Responsive Design
- UI/UX Consistency

# ✅ Task Management

## Frontend

- Task Management Listing UI
- Task Overview Cards
- Task Search
- Status, Priority, Assignee, and Due Date Filters
- Task Table
- Pagination
- Kanban View
- Task Status Columns
- New Task UI
- Task Form
- Responsive Design
- Frontend Testing

# 📅 Activity Management

## Backend

### Activity CRUD APIs

- Activity Model
- Activity Serializer
- Create Activity
- Get All Activities
- Get Activity by ID
- Update Activity
- Delete Activity
- Activity Status Update
- JWT Authentication
- Serializer Validation
- API Error Handling

### Activity Search, Filtering & Supporting APIs

- Activity Search
- Type Filtering
- Status Filtering
- Priority Filtering
- Assignee Filtering
- Date Range Filtering Support
- Pagination
- Ordering
- Total Records Count
- Calendar Data Support
- Activity Type Options
- Activity Status Options
- Activity Priority Options
- Assignee Options
- Activity Summary and Count Support
- Optimized Database Queries
- Postman API Testing
- Backend Test Cases

# 📝 Notes Management

## Backend

- Notes APIs
- Notes data handling
- API validation
- JWT Authentication
- Backend testing

# 📊 Reports & Revenue

## Frontend

- Reports Dashboard UI
- Revenue Module UI
- Analytics overview cards
- Reporting and revenue visualizations
- Responsive design
- UI/UX consistency with the existing CRM design system

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

## Contacts

| Method | Endpoint |
|---------|----------|
| POST | `/api/contacts/` |
| GET | `/api/contacts/` |
| GET | `/api/contacts/{id}/` |
| PATCH | `/api/contacts/{id}/` |
| DELETE | `/api/contacts/{id}/` |

Supports:

- Search
- Status Filtering
- Ordering
- Pagination
- Total Records Count
- JWT Authentication
- Validation

---

## Companies

| Method | Endpoint |
|---------|----------|
| POST | `/api/companies/` |
| GET | `/api/companies/` |
| GET | `/api/companies/{id}/` |
| PATCH | `/api/companies/{id}/` |
| DELETE | `/api/companies/{id}/` |
| GET | `/api/companies/filter-options/` |

Supports:

- Search
- Industry Filtering
- Company Size Filtering
- Status Filtering
- Ordering
- Pagination
- Total Records Count
- Supporting Filter Options
- JWT Authentication
- Validation

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
│   ├── Follow-ups
│   ├── Email Templates
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

### Contact APIs

- Contact CRUD Operations
- Search
- Status Filtering
- Ordering
- Pagination
- Total Records Count
- JWT Authentication
- Validation
- Error Handling

### Companies

| Method | Endpoint |
|---------|----------|
| POST | `/api/companies/` |
| GET | `/api/companies/` |
| GET | `/api/companies/{id}/` |
| PATCH | `/api/companies/{id}/` |
| DELETE | `/api/companies/{id}/` |
| GET | `/api/companies/filter-options/` |

Supports:

- Search
- Industry Filtering
- Company Size Filtering
- Status Filtering
- Ordering
- Pagination
- Total Records Count
- Supporting Filter Options
- JWT Authentication
- Validation

## Sales Pipeline APIs

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

## Day 8

### Backend

- Opportunity Model
- Opportunity Serializer
- Opportunity CRUD APIs
- Create Opportunity API
- Get All Opportunities API
- Get Opportunity by ID API
- Update Opportunity API
- Delete Opportunity API
- Search
- Filtering
- Ordering
- Pagination
- JWT Authentication
- Serializer Validation
- Backend Test Cases
- Postman API Testing
- Opportunity Statistics API
- Opportunity Filters API
- Customer Dropdown API
- Company Dropdown API
- Opportunity Dashboard Summary API
- Aggregation Queries
- Optimized Database Queries
- API Validation
- Backend Debugging

### Frontend

- Opportunity Management UI Refinements
- Opportunity Listing UI
- Opportunity Statistics Cards
- Opportunity Search and Filtering UI
- Opportunity Stage Filters
- Opportunity Status Filters
- Opportunity Actions
- UI Enhancement Suggestions
- CSS Conflict Resolution
- Git Merge Conflict Resolution
- Responsive UI Review
- Frontend Module Review

### Integration

- Completed Sales Pipeline frontend-backend integration
- Pipeline Summary API Integration
- Pipeline Stage API Integration
- Recent Deals API Integration
- Pipeline Performance API Integration
- API Response Verification
- Frontend-Backend Data Flow Verification
- End-to-End Pipeline Testing
- Integration Issue Resolution
- Git Branch Synchronization
- Pull Request Preparation


## Day 9

### Backend

- Contact CRUD APIs
- Contact Serializer
- Contact Field Validation
- JWT Authentication
- Contact Search
- Status Filtering
- Pagination
- Ordering
- Total Records Count
- Optimized Database Queries
- API Error Handling
- Postman API Testing
- Backend Test Cases

### Frontend

- Follow-ups Dashboard UI
- Follow-up Overview Cards
- Follow-up Listing Table
- Search and Filter UI
- Follow-up Actions
- Upcoming Reminders UI
- Follow-up Insights UI
- Pagination
- Responsive UI Review
- Sidebar and UI Enhancements
- Sales Pipeline Typography and Card Icon Improvements
- Company Table and Form UI Improvements
- Contact Table and Action Button Improvements
- Contact Delete Confirmation and Success Feedback
- CSS Conflict Resolution
- Git Merge and UI Review

### Integration

- Contacts Listing Integration
- Add Contact Integration
- View Contact Integration
- Edit and Update Contact Integration
- Delete Contact Integration
- Search and Status Filter Integration
- Pagination and Ordering Integration
- JWT Authentication
- Validation and Error Handling
- End-to-End Contact Module Testing
- Git Branch Synchronization

## Day 10

### Backend

- Company CRUD APIs
- Company Serializer and Field Validation
- JWT Authentication
- Database Relationships
- API Error Handling
- Optimized Database Queries
- Company Search
- Industry Filtering
- Company Size Filtering
- Status Filtering
- Pagination
- Ordering
- Total Records Count
- Company Filter Options API
- Postman API Testing
- Backend Test Cases

### Frontend

- Email Templates Listing UI
- Create Email Template UI
- View Email Template UI
- Edit and Duplicate Template Actions
- Delete Confirmation Popup
- Template Search and Pagination
- Email Content Editor and Variable Insertion
- Email Preview
- Task Management UI Development
- Task Listing and Overview Cards
- Kanban View
- New Task UI

### Integration

- Company API Integration
- Companies Listing Integration
- Add, View, Edit, Update, and Delete Company Integration
- Search and Filtering Integration
- Pagination and Ordering Integration
- End-to-End Company Module Testing
- Integration work remains in progress

## Day 11

### Backend

- Activity CRUD APIs
- Activity Serializer and Validation
- Activity Status Update API
- Activity Search
- Activity Type Filtering
- Activity Status Filtering
- Activity Priority Filtering
- Activity Assignee Filtering
- Activity Date Range Filtering Support
- Pagination and Ordering
- Total Records Count
- Calendar Data Support
- Activity Summary and Count Support
- Activity Supporting Data APIs
- Notes APIs
- JWT Authentication
- Optimized Database Queries
- Postman API Testing
- Backend Test Cases

### Frontend

- Reports Dashboard UI
- Revenue Module UI
- Reports and Revenue overview cards
- Analytics and reporting visualizations
- Responsive UI implementation
- UI/UX consistency with the existing Softiq CRM design system

### Integration

- Activity API integration support
- Notes API integration support
- Frontend-backend request and response verification
- API validation and error handling
- End-to-end testing of Activity and Notes functionality
- Git branch synchronization and Pull Request preparation

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
| Sales Pipeline UI | ✅ Completed |
| Sales Pipeline Integration | ✅ Completed |
| Opportunity APIs | ✅ Completed |
| Opportunity Analytics APIs | ✅ Completed |
| Opportunity UI | ✅ Completed |
| Contact UI | ✅ Completed |
| Contact APIs | ✅ Completed |
| Contact API Integration | ✅ Completed |
| Company Management UI | ✅ Completed |
| Company CRUD APIs | ✅ Completed |
| Company Search & Supporting APIs | ✅ Completed |
| Company API Integration | 🟡 In Progress |
| Follow-ups UI | ✅ Completed |
| Email Templates UI | ✅ Completed |
| Task Management UI | 🟡 In Progress |
| Dashboard Integration | 🟡 In Progress |
| Reports & Analytics UI | ✅ Completed |
| Revenue Module UI | ✅ Completed |
| Activity APIs | ✅ Completed |
| Notes APIs | ✅ Completed |

---

# 🚀 Future Modules

- Notifications
- Role-Based Access Control (RBAC)
- Settings

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
