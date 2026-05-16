# AI Powered Learning Management System

FastAPI + React LMS for AI-generated MCQ assessments using Ollama.

## Stack

- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: React, Vite
- AI: Ollama `/api/generate`

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

By default, Vite proxies `/api` to `http://127.0.0.1:8000`, which is correct when React and FastAPI run on the same machine and Ollama runs on the VM.

If you need a different backend host, create `frontend/.env` from `frontend/.env.example`.

## Default AI Settings

- Ollama URL: `http://10.100.60.121:11434/api/generate`
- Primary model: `qwen3:30b`
- Validator model: `mistral:latest`

Override these with environment variables in `backend/.env` if needed.

## Important Host Separation

- Frontend dev server: `http://localhost:5173`
- FastAPI app: usually `http://127.0.0.1:8000`
- Ollama on VM: `http://10.100.60.121:11434`

The frontend should call the FastAPI app, not the Ollama VM directly.
