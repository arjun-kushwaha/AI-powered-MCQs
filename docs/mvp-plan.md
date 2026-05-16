# AI-Powered LMS MVP Plan

## Product Goal

Build a web-based learning and assessment platform for competitive exam students and corporate employees. Users can register, define test preferences, paste a syllabus or topic list, generate MCQs with Ollama, attempt quizzes, and receive a result summary and certificate-ready completion record.

## MVP Scope

- Minimal landing page with clear call to action
- User registration and login
- User profile settings for timer and negative marking
- Topic or syllabus input
- AI-powered MCQ generation through Ollama
- Storage of generated question sets and questions in SQLite
- Timed quiz flow with attempt submission
- Result calculation:
  - total questions
  - attempted questions
  - correct answers
  - wrong answers
  - unattempted questions
  - negative marks
  - final score
  - accuracy percentage
- Certificate-ready result endpoint

## Out of Scope for MVP

- Payments
- Multi-tenant enterprise hierarchy
- Email verification and password reset
- Proctoring
- Multi-language localization
- Complex analytics dashboards
- Vector search or RAG
- Admin review console

## User Roles

- Learner: creates question sets, attempts quizzes, views results and certificates

## Core User Flows

1. Register and log in
2. Update assessment preferences in profile
3. Paste syllabus or topic list
4. Generate a question set with AI
5. Review generated questions
6. Start an attempt
7. Submit answers
8. View score summary and certificate-ready record

## Architecture

### Frontend

- React
- React Router
- Simple CSS with a minimal layout

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- JWT authentication
- Service layer for Ollama integration and scoring

### AI Integration

- Ollama `/api/generate`
- Primary model: `qwen3:30b`
- Fallback validator model: `mistral:latest`

## Backend Modules

- `auth`: registration, login, current user
- `profiles`: test preferences
- `question_sets`: creation and listing
- `questions`: generated question storage
- `attempts`: start and submit quiz attempts
- `results`: calculated summaries
- `ai_generation`: calls Ollama and normalizes output

## Data Model

- `users`
- `profiles`
- `question_sets`
- `questions`
- `question_options`
- `attempts`
- `attempt_answers`

## API Sequence

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/profile/me`
4. `PUT /api/profile/me`
5. `POST /api/question-sets/generate`
6. `GET /api/question-sets`
7. `GET /api/question-sets/{id}`
8. `POST /api/attempts`
9. `POST /api/attempts/{id}/submit`
10. `GET /api/attempts/{id}`

## Implementation Phases

### Phase 1

- Backend scaffold
- SQLite schema
- Auth and profile APIs

### Phase 2

- Ollama MCQ generation
- Question set persistence
- Quiz attempt flow and scoring

### Phase 3

- React landing page and dashboard
- Question generation UI
- Test-taking UI
- Result and certificate UI

### Phase 4

- Local verification
- Bug fixes
- Documentation

## Near-Term Enhancements

- Explanations for each MCQ
- Difficulty levels
- Topic-wise analytics
- Retry wrong answers mode
- Corporate assignment flow
- Admin review of generated questions
