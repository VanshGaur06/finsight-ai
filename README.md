# FinSight AI 💳🤖

FinSight AI is a premium, production-ready personal finance tracker web application that integrates Google Gemini AI to analyze your transaction ledgers and deliver smart, personalized financial coaching insights. It features responsive dashboards, interactive analytics, and budget guardrails wrapped in a futuristic dark glassmorphism layout.

---

## Key Features

1. **🔒 Secure Authentication**
   - User registration and login utilizing Firebase Authentication.
   - Profile documents generated automatically inside Firestore on signup.
   - Protected layout routes preventing unauthenticated access.

2. **📊 Responsive FinTech Dashboard**
   - Real-time stat trackers: Total Net Balance, Total Income, Total Expenses, and Monthly Savings.
   - Interactive monthly budget utilization tracking.
   - Alerts and notification banners if expenses exceed limits.

3. **📝 Transaction Management (CRUD)**
   - Create, Read, Update, and Delete entries under secure subcollections (`users/{uid}/transactions`).
   - Category tags: *Food, Travel, Shopping, Bills, Education, Investment, Entertainment, and Others*.
   - Sorting, title searching, and dual-filtering (by category and transaction type).

4. **📈 Interactive Analytics & Visualizations**
   - Interactive Grouped Bar Chart comparing monthly Income vs Expense.
   - Dynamic Area Chart outlining Savings Trends.
   - Sleek Donut Pie Chart mapping category splits.
   - Powered by **Recharts** with glassmorphic tooltip wrappers.

5. **🤖 Gemini AI Financial Assistant**
   - **Ledger Spending Audit**: Running audits on transaction structures to extract summary data, saving opportunities, leakage points, and custom budget values.
   - **AI Chat Coach**: Talk in real-time with an AI chatbot regarding your active budget context.

---

## Technology Stack

- **Frontend Core**: React 19, Vite, TypeScript
- **Styling & Animation**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Visuals**: Recharts
- **Database & Auth**: Firebase Auth, Firestore
- **AI Core**: Google Gemini API SDK (`@google/generative-ai`)

---

## Project Folder Structure

```text
src/
 ├── assets/          # SVG and static assets
 ├── components/      # UI components (Layout, Sidebar, Modal, ProtectedRoute)
 ├── context/         # AuthContext (state provider for Firebase)
 ├── firebase/        # Config setups for Firestore database & Auth
 ├── hooks/           # Custom React hooks (useTransactions, useBudget)
 ├── pages/           # Application views (Landing, Login, Signup, Dashboard, Analytics, AI assistant, Profile)
 ├── services/        # Service layers (Gemini API, database config)
 └── utils/           # Helper scripts (currency and date formatting)
```

---

## Setup & Local Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- Firebase Project setup
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Step-by-Step Launch

1. **Clone or Navigate to the Directory**:
   ```bash
   cd finsight-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   - Duplicate `.env.example` as `.env` in the root:
     ```bash
     cp .env.example .env
     ```
   - Populate `.env` with your Firebase config credentials and your Google Gemini API key:
     ```env
     VITE_FIREBASE_API_KEY=AIzaSy...
     VITE_FIREBASE_AUTH_DOMAIN=finsight-ai.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=finsight-ai
     VITE_FIREBASE_STORAGE_BUCKET=finsight-ai.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
     VITE_FIREBASE_APP_ID=1:1234:web:abcd
     
     VITE_GEMINI_API_KEY=AIzaSy...
     ```

4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   - Open your browser to the local address displayed (e.g. `http://localhost:5173`).

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Deploy to Vercel

FinSight AI is ready to deploy to Vercel with single-page routing fully configured.

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
2. **Run Deploy**:
   ```bash
   vercel
   ```
3. **Configure Environment Variables**: Add your `VITE_` variables in Vercel's Project Dashboard settings.

---

## Screenshots

*(Placeholder section to attach your application dashboards, transaction logs, and Gemini AI assistant chatbot panels)*
