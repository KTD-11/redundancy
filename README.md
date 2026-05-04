# SynCare Frontend

🚀 **Live Website (GitHub Pages)**: [https://asd33366544.github.io/frontend_checkinsystem](https://asd33366544.github.io/frontend_checkinsystem)

A modular React frontend for the SynCare medical appointment booking system.

## 📁 Project Structure

```
src/
├── api/
│   ├── apiClient.js        # Base fetch wrapper, JWT helpers, token expiry
│   ├── auth.js             # signup, signin, deleteAccount
│   ├── appointments.js     # bookAppointment, fetchAppointment, cancelAppointment
│   └── admin.js            # adminFetchUser, adminFetchAppointment
│
├── components/
│   ├── forms/
│   │   ├── LoginForm.jsx         # Sign-in form
│   │   ├── SignupForm.jsx        # Registration form (all backend fields)
│   │   └── AppointmentForm.jsx  # Book appointment (date, time, clinic type)
│   └── ui/
│       ├── Button.jsx / .css
│       ├── Input.jsx  / .css    # Works as input, select, or textarea
│       ├── Alert.jsx  / .css    # Error / success / warning / info
│       ├── Loader.jsx / .css
│       ├── Navbar.jsx / .css
│       └── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
│
├── context/
│   └── AuthContext.js      # Global auth state (user, isLoggedIn, login, logout)
│
├── hooks/
│   ├── useForm.js          # Reusable form handler (validation, submission, state)
│   └── useAppointments.js  # book, fetchById, cancel with loading/error state
│
├── pages/
│   ├── HomePage.jsx / .css
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx / .css
│   ├── BookAppointmentPage.jsx
│   ├── AppointmentsPage.jsx / .css
│   └── NotFoundPage.jsx / .css
│
├── utils/
│   ├── constants.js        # BASE_URL, TOKEN_KEY, CLINIC_TYPES, etc.
│   └── validators.js       # All validation rules matching backend constraints
│
├── global.css              # CSS variables (light/dark), reset, typography
├── App.jsx                 # Router, theme, AuthProvider
└── index.js                # React entry point
```

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set REACT_APP_API_BASE_URL

# 3. Start development server
npm start
```

## 🔐 Auth Flow

- JWT stored in `localStorage` under key `syncare_token`
- Token timestamp stored under `syncare_token_ts`
- Token automatically expires after **2 hours** — apiClient fires a `syncare:session-expired` event, which AuthContext catches to log the user out
- `Authorization: Bearer <token>` header is added automatically for protected calls

## 📋 Validation Rules (matching backend)

| Field      | Rule |
|------------|------|
| `age`      | Integer, 0–200 |
| `gender`   | `M` or `F` (case-insensitive) |
| `gov_id`   | Exactly 14 digits, starts with `2` or `3` |
| `password` | Minimum 10 characters |
| `date`     | `DD/MM/YYYY`, must be a future date |
| `time`     | `HH:MM` (24-hour) |
| `type`     | One of the 11 valid clinic strings |

## 🌙 Theme

Dark / light mode toggled via the Navbar switch. Preference saved in `localStorage` (`syncare_theme`). CSS variables drive all colours — no JS needed per-component.
