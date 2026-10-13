# Full-Stack Practice Project — TaskFlow

A beginner-friendly full-stack task manager for practicing frontend, backend, database, Docker, and CI.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)
- API: REST CRUD endpoints
- Container: Docker + Docker Compose
- CI: GitHub Actions workflow

## Requirements
- Node.js 20+ and npm, or Docker Desktop

## Run locally
1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Open http://localhost:3000

The SQLite database is created automatically at `data/tasks.db`.

## Run with Docker
```bash
docker compose up --build
```
Open http://localhost:3000. Stop with `Ctrl+C`, then `docker compose down`.

## API endpoints
- `GET /api/health` — health check
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task (`{"title":"Learn Docker","description":"Practice compose"}`)
- `PATCH /api/tasks/:id` — update task (`{"title":"Updated title","completed":true}`)
- `DELETE /api/tasks/:id` — delete task

## Practice checklist
- [ ] Add task priorities and due dates
- [ ] Add search and filtering
- [ ] Add input validation and friendly error messages
- [ ] Write API tests
- [ ] Add a database migration strategy
- [ ] Add authentication only after learning secure password handling
- [ ] Add a reverse proxy with Nginx
- [ ] Add GitHub Actions lint/test/build steps
- [ ] Add monitoring and structured logs
- [ ] Deploy to a cloud test environment

## Security notes
This is a learning project, not production-ready. Do not add real personal or sensitive data. Keep secrets out of Git. The included `.env.example` contains non-secret defaults only.
