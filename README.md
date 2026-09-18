# WasteWise — Recycle. Earn. Repeat.

A smart recycling machine that rewards you for every bottle and packet you recycle. Scan your QR, drop your waste, earn points.

**Live site:** `frontend/index.html` (pure HTML/CSS/JS, no build step)

## Features
- Hero with scroll progress + lightweight parallax
- How it works (4 steps), What we collect, Rewards, Gamification, Impact counters
- Responsive, liquid-glass design, `prefers-reduced-motion` support
- **Auth:** Login / Register with Java + MySQL backend (BCrypt + JWT)

## Structure
```
wastewise/
├── frontend/
│   ├── index.html
│   ├── login.html      # Sign in / Create account
│   ├── style.css
│   ├── script.js
│   ├── auth.js         # Login/register logic (calls /api/auth/*)
│   └── logo.jpeg
└── backend/            # Java 17 + Spring Boot 3.3 + MySQL (local Workbench 8.0)
    ├── pom.xml
    └── src/main/java/com/wastewise/...
        ├── WasteWiseApplication.java
        ├── auth/AuthController.java + JwtService.java
        ├── user/User.java + UserRepository.java
        ├── config/CorsConfig.java
        └── health/HealthController.java
```

## Run locally

### Frontend only (no backend)
Just open `frontend/index.html` in a browser, or:
```bash
npx serve frontend
python -m http.server --directory frontend 8000
```

### Full stack (frontend + Java + MySQL Workbench 8.0 CE) — Local DB only, no Docker

**Prereq:** MySQL Server 8.0 running (Service `MySQL80`), DB `wastewise` + user `wastewise`/`wastewise123` created in Workbench:
```sql
CREATE DATABASE IF NOT EXISTS wastewise;
CREATE USER IF NOT EXISTS 'wastewise'@'localhost' IDENTIFIED BY 'wastewise123';
GRANT ALL PRIVILEGES ON wastewise.* TO 'wastewise'@'localhost';
```

**1. Run backend (local MySQL):**
```bash
C:\Users\Ishan\AppData\Local\Temp\opencode\apache-maven-3.9.9\bin\mvn -f backend/pom.xml spring-boot:run
# or jar (after mvn package)
java -jar backend/target/wastewise-backend-0.1.0.jar
# backend -> http://localhost:8080 (health: /api/health)
# uses backend/src/main/resources/application.properties:3 (wastewise/wastewise123)
```

**2. Open frontend:**
- Open `frontend/login.html` -> Sign in / Create account connects to `http://localhost:8080`
- Or serve frontend: `npx serve frontend` then visit `http://localhost:3000/login.html`

API base is `http://localhost:8080` by default; override in `frontend/auth.js` via `window.__WASTEWISE_API__` or edit `API_BASE`.

### Database
- Table `users` auto-created via `spring.jpa.hibernate.ddl-auto=update`
- Columns: `id`, `name`, `email` (unique), `password_hash` (BCrypt), `created_at`
- Passwords never stored plain.

### API
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{name,email,password}` | `{token, user}` |
| POST | `/api/auth/login` | `{email,password}` | `{token, user}` |
| GET | `/api/health` | — | `{status:"ok"}` |
| GET | `/api/auth/count` | — | `{count}` |

## Deploy (GitHub Pages)
For frontend only:
1. Go to repo Settings → Pages
2. Source: `Deploy from a branch` → Branch: `main` → Folder: `/frontend`
3. Save — site will be at `https://Ishan-113.github.io/Wastewise/`

Backend needs separate hosting (Render, Railway, Fly.io) with MySQL env `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.

© 2026 WasteWise · Smart Eco Recycling & Reward System
