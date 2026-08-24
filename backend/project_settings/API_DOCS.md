# Project Settings API

Base URL: `/api/settings/project/`
Auth: All endpoints require a valid JWT access token via `Authorization: Bearer <token>`.

Content types: JSON for everything except logo upload (`multipart/form-data`).

---

## 1. General Settings

### `GET /api/settings/project/general/`

Returns the project settings singleton.

**Response `200`**
```json
{
  "id": 1,
  "name": "Softiq CRM",
  "code": "SOFTIQ",
  "description": "Customer relationship management platform.",
  "timezone": "(GMT+05:00) Asia/Karachi",
  "logo": "/media/project_logo/logo.png",   // null when no logo uploaded
  "updated_at": "2026-08-25T10:30:00Z"
}
```

### `PATCH /api/settings/project/general/`

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 1–100 chars |
| `code` | string | required, `[A-Z0-9_-]{1,20}`, unique per deployment |
| `description` | string | optional, max 500 |
| `timezone` | string | must contain a valid IANA zone after `")"`, e.g. `(GMT+05:00) Asia/Karachi` |

**Error responses**
- `400`: field errors keyed by field name.
- `409`: duplicate project code.

### `POST /api/settings/project/general/logo/`

Uploads/replaces the logo. Replaces any previous file on disk.

- Content-Type: `multipart/form-data`, field name `logo`.
- Allowed types: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/svg+xml`.
- Max size: **2 MB**.

**Response `200`** → full General Settings object with new `logo` URL.

**Errors**: `400` (missing file / bad type / too large), `401`.

### `DELETE /api/settings/project/general/logo/`

Removes the current logo from storage and clears the field.

**Response `200`** → `{ "detail": "Logo removed successfully." }`
**Error**: `400` if no logo is set.

---

## 2. Company Information

### `GET /api/settings/project/company/`

```json
{
  "company_name": "Softiq Technologies",
  "industry": "Software & Technology",
  "address_line_1": "Plot 12, Block B",
  "address_line_2": "",
  "city": "Lahore",
  "state_province": "Punjab",
  "postal_code": "54000",
  "country": "Pakistan",
  "phone_number": "+92 42 111 000 111",
  "website_url": "https://softiq.example.com"
}
```

### `PATCH /api/settings/project/company/`

All fields optional; strings limited to 200 chars (`website_url` and `phone_number` to 50). Partial updates supported.

---

## 3. Localization

### `GET /api/settings/project/localization/`

```json
{
  "language": "English",
  "date_format": "MM/DD/YYYY",
  "time_format": "12 Hour",
  "currency_symbol": "$",
  "first_day_of_week": "Monday"
}
```

### `PATCH /api/settings/project/localization/`

All fields validated against fixed option sets:

| Field | Allowed values |
|---|---|
| `language` | English, Spanish, French, German, Arabic, Urdu, Chinese |
| `date_format` | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD |
| `time_format` | 12 Hour, 24 Hour |
| `currency_symbol` | `$ € £ ¥ ₹ ﷼` |
| `first_day_of_week` | Sunday, Monday, Saturday |

Invalid values → `400` with field error listing valid options.

---

## 4. Email Settings

### `GET /api/settings/project/email/`

```json
{
  "outgoing_from_name": "Softiq CRM",
  "outgoing_from_email": "crm@softiq.example.com",
  "smtp_host": "smtp.example.com",
  "smtp_port": 587,
  "encryption": "TLS",
  "smtp_username": "crm@softiq.example.com",
  "has_smtp_password": true,
  "email_footer_text": "© 2026 Softiq Inc."
}
```

The SMTP password is never returned. `has_smtp_password` indicates whether one is stored server-side.

### `PATCH /api/settings/project/email/`

- `smtp_port`: integer 1–65535.
- `encryption`: `None` | `SSL/TLS` | `STARTTLS`.
- `smtp_password`: write-only. Omit or send empty string to keep the stored password; sending a non-empty value overwrites it.

### `POST /api/settings/project/email/test/`

Sends a test email using the stored SMTP configuration.

**Request**
```json
{ "recipient": "you@example.com" }
```

**Response `200`**
```json
{ "message": "Test email sent successfully to you@example.com." }
```

**Error responses**
- `400`: missing/invalid recipient.
- `400`: no SMTP host configured (`{"detail": "SMTP host is not configured..."}`).
- `502`: SMTP connection/send failure (includes provider error detail).

---

## 5. Security

### `GET /api/settings/project/security/`

```json
{
  "password_min_length": 8,
  "require_uppercase": true,
  "require_numbers": true,
  "require_special_characters": false,
  "session_timeout_minutes": 60,
  "max_login_attempts": 5,
  "lockout_duration_minutes": 30,
  "two_factor_enabled": false,
  "ip_whitelist": ""
}
```

### `PATCH /api/settings/project/security/`

| Field | Rules |
|---|---|
| `password_min_length` | int 6–64 |
| `session_timeout_minutes` | int; **0 = never expire**, otherwise 5–1440 |
| `max_login_attempts` | int; **0 = unlimited**, otherwise 3–10 |
| `lockout_duration_minutes` | int; **0 = permanent**, otherwise 1–1440 |
| `ip_whitelist` | comma-separated IPs/CIDRs, e.g. `192.168.1.0/24, 10.0.0.15`; each entry validated |

---

## 6. Roles & Permissions

Standard DRF ModelViewSet at `/api/settings/roles/`:

- `GET /api/settings/roles/` — paginated list (page size 10).
- `POST /api/settings/roles/` — create role.
- `GET /api/settings/roles/{id}/`
- `PATCH /api/settings/roles/{id}/`
- `DELETE /api/settings/roles/{id}/` — returns `403` for system roles (Administrator, Manager, Sales Representative, Viewer).

If no roles exist yet, the four default system roles are seeded automatically on first list request.

**Role payload**

```json
{
  "id": 1,
  "name": "Administrator",
  "description": "Full unrestricted access to all modules.",
  "access_level": "full",
  "color": "#4f46e5",
  "bg_color": "#eef2ff",
  "is_system_role": true,
  "users_assigned": 1,
  "created_at": "2026-08-25T09:00:00Z",
  "updated_at": "2026-08-25T09:00:00Z",
  "permissions": {
    "dashboard":    { "view": true, "create": true, "edit": true, "delete": true },
    "customers":    { "view": true, "create": true, "edit": true, "delete": true },
    "contacts":     { "view": true, "create": true, "edit": true, "delete": true },
    "leads":        { "view": true, "create": true, "edit": true, "delete": true },
    "opportunities":{ "view": true, "create": true, "edit": true, "delete": true },
    "deals":        { "view": true, "create": true, "edit": true, "delete": true },
    "activities":   { "view": true, "create": true, "edit": true, "delete": true },
    "companies":    { "view": true, "create": true, "edit": true, "delete": true },
    "reports":      { "view": true, "create": true, "edit": true, "delete": true },
    "settings":     { "view": true, "create": true, "edit": true, "delete": true }
  }
}
```

Permission keys are normalized server-side: unknown modules are dropped and every module always exposes exactly the four boolean actions (`view`, `create`, `edit`, `delete`). `access_level` accepts `full`, `team`, `sales`, `view`, `custom`.

---

## Error format

Validation failures return DRF-standard field errors:

```json
{
  "code": ["Project code may only contain uppercase letters, numbers, hyphens and underscores."]
}
```

Non-field failures use `{"detail": "..."}`. HTTP status codes: `400` validation, `401` unauthenticated, `403` forbidden action, `404` not found, `409` conflict (duplicate code), `502` upstream SMTP failure.

## Frontend client

All endpoints are wrapped in `frontend/src/lib/projectSettingsApi.ts`.
