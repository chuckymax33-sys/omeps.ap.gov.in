# Transit Permit Portal

An enterprise-grade Transport Transit Permit Management Portal built with a React (TypeScript + Vite) frontend and a FastAPI (PostgreSQL/SQLite) backend.

---

## 🛠️ Environment Configuration

Create or update the `.env` file in the root directory:

```env
SECRET_KEY=b64a13bf2a3f01c87dc2612f0e0ea06e30bc01f807f4ebcf4fb3964db6e56845
DATABASE_URL=sqlite:///./transit_permits.db  # Use Supabase URL for production
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## 🚀 Running the FastAPI Backend

The backend is built using FastAPI and requires Python with the dependencies installed.

### 1. Setup & Activate Virtual Environment
```powershell
# Create environment (if not already done)
python -m venv .venv

# Activate on Windows (PowerShell)
.venv\Scripts\activate
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Run the Backend Server
Run the FastAPI backend using `uvicorn` (runs on `http://127.0.0.1:8000`):
```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Note: On startup, the backend automatically seeds the default admin user configured in your `.env` if none exist.*

---

## 💻 Running the React Frontend

The frontend is built with React, TypeScript, and Vite.

### 1. Install Node Dependencies
```powershell
npm install
```

### 2. Run the Development Server
Normally, you can run:
```powershell
npm run dev
```

#### ⚠️ Windows Disk Space Bypass (ENOSPC Error)
If your `C:\` drive is low on space and you encounter an `ENOSPC: no space left on device` error, run the following PowerShell command to route caching and temp directories to the `D:\` drive:
```powershell
$env:TEMP="D:\project-k\.tmp"; $env:TMP="D:\project-k\.tmp"; New-Item -ItemType Directory -Force -Path "D:\project-k\.tmp" | Out-Null; node_modules\.bin\vite.cmd
```

---

## ☁️ Supabase PostgreSQL Integration

To migrate from the local SQLite database to Supabase:

### 1. Create Tables & Indexes
1. Go to your **Supabase Dashboard** > **SQL Editor**.
2. Click **New query**.
3. Copy the schema script from [supabase_schema.sql](file:///d:/project-k/supabase_schema.sql) and click **Run**.

### 2. Connect Your App
Update the `DATABASE_URL` in your `.env` file with your Supabase Transaction/URI Connection String:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
```
Once updated, restart the backend server; tables will be loaded and seeded automatically!
