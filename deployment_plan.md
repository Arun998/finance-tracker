# Deployment Plan for Finance Tracker App

This guide outlines the steps to deploy your MERN stack application. We will use **Vercel** for the frontend and **Render** (or Railway) for the backend, as they offer excellent free tiers and easy integration with GitHub.

## Prerequisites
- [ ] GitHub repository with your latest code (already done).
- [ ] Accounts on [Vercel](https://vercel.com) and [Render](https://render.com).
- [ ] MongoDB Atlas connection string.

---

## Phase 1: Code Preparation (Crucial)

Currently, your frontend code points to `http://localhost:5000`. We need to make this dynamic so it works in production.

### 1. Create a Config File
Create `frontend/src/config.js` to manage the API URL based on the environment.
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default API_URL;
```

### 2. Refactor Frontend Components
Replace all instances of `'http://localhost:5000'` with the `API_URL` import in:
- `frontend/src/App.jsx`
- `frontend/src/components/ExpenseForm.jsx`
- `frontend/src/components/StatementPage.jsx`
- `frontend/src/components/StatementUploader.jsx`

### 3. Backend CORS
Ensure your backend allows requests from your production frontend URL. In `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-project-name.vercel.app' // Add this after deploying frontend
  ],
  credentials: true
}));
```

---

## Phase 2: Backend Deployment (Render)

1. **New Web Service**: Log in to Render and click "New +", then "Web Service".
2. **Connect Repo**: Select your `finance-tracker` repository.
3. **Settings**:
   - **Root Directory**: `backend` (Important!)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**:
   Add the following variables in the "Environment" tab:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `PORT`: `5000` (or let Render assign one, usually 10000).
   - `NODE_ENV`: `production`
5. **Deploy**: Click "Create Web Service". Wait for it to go live.
6. **Copy URL**: Once live, copy your backend URL (e.g., `https://finance-backend.onrender.com`).

---

## Phase 3: Frontend Deployment (Vercel)

1. **New Project**: Log in to Vercel and click "Add New...", then "Project".
2. **Connect Repo**: Select your `finance-tracker` repository.
3. **Settings**:
   - **Root Directory**: `frontend` (Click "Edit" next to Root Directory and select `frontend`).
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Paste your **Render Backend URL** here (e.g., `https://finance-backend.onrender.com`).
     *Note: Do not add a trailing slash `/` unless your code expects it.*
5. **Deploy**: Click "Deploy".

---

## Phase 4: Final Configuration

1. **Update CORS**: Go back to your backend code (`server.js`), add your new Vercel frontend URL to the CORS origin list, commit, and push. Render will auto-redeploy.
2. **Test**: Open your Vercel URL and test adding an expense or viewing the dashboard.

## Next Steps
Would you like me to start **Phase 1** by refactoring the frontend code to use environment variables?
