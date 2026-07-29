# 🚀 AquaSafe AI — Local Setup Guide

This guide will walk you through setting up **AquaSafe AI** locally from scratch after cloning the repository.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Git**: [Download Git](https://git-scm.com/)
- **Python**: 3.9 or higher ([Download Python](https://www.python.org/))
- **Node.js**: v18 or higher ([Download Node.js](https://nodejs.org/))

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Clone the Repository

Open your terminal or command prompt and clone the repository:

```bash
git clone https://github.com/your-username/aquasafe-ai.git
cd aquasafe-ai
```

---

### 2. Set Up Python Virtual Environment (`venv`) & Machine Learning Engine

> **Why `venv`?** The virtual environment keeps Python packages isolated from your global system environment.

#### A. Create the Virtual Environment

Run the following command in the root folder of the project:

```bash
python -m venv venv
```

#### B. Activate the Virtual Environment

- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If you get a permission error, run PowerShell as Administrator once and run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

- **Windows (Command Prompt / CMD)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```

- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

Once activated, your terminal prompt will show `(venv)`.

#### C. Install Python Dependencies

With the virtual environment active, install all required ML packages:

```bash
pip install -r requirements.txt
```

#### D. Train the XGBoost Models

Train the machine learning models so the backend can serve AI risk predictions:

```bash
python ml/train_xgboost.py
```

*This generates the trained model files inside `ml/models/`.*

---

### 3. Set Up Backend Server (Node.js & Express)

Open a new terminal (or navigate to `backend` in your current terminal):

```bash
cd backend
```

#### A. Install Node Dependencies

```bash
npm install
```

#### B. Configure Environment Variables

Create a `.env` file inside the `backend` folder by copying `.env.example`:

- **Windows**:
  ```cmd
  copy .env.example .env
  ```
- **Linux / macOS**:
  ```bash
  cp .env.example .env
  ```

*(Optionally add your Gemini API key inside `.env` if you want AI summary capabilities enabled).*

---

### 4. Set Up Frontend App (React & Vite)

Open a new terminal (or navigate to `frontend`):

```bash
cd frontend
```

#### Install Node Dependencies

```bash
npm install
```

---

## 🏃 Running the Application

### Option 1: Quick Launch (Windows)

If you are on Windows, simply double-click **`start_aquasafe.bat`** or run:

```cmd
.\start_aquasafe.bat
```

This automatically launches both the **Backend Server (Port 3001)** and **Frontend App (Port 3000)** in separate terminal windows.

---

### Option 2: Manual Start (All Operating Systems)

#### Terminal 1 — Backend
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:3001`)*

#### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:3000`)*

---

## 🌐 Accessing the System

Open your browser and visit:

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API Status**: `http://localhost:3001/api/health`

---

## 🔍 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **PowerShell script execution error** | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell. |
| **`FileNotFoundError: Trained XGBoost models not found`** | Make sure you activated `venv` and ran `python ml/train_xgboost.py` first. |
| **Python not recognized in Backend** | Ensure Python is added to your system `PATH` or run the backend from an activated `venv` session. |
