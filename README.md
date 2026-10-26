# HopeHands Node.js Backend

## Requirements
- Node.js LTS and npm
- MySQL Server running locally

## Configure database
Copy `.env.example` to `.env` and set your MySQL password:

PowerShell:
```powershell
Copy-Item .env.example .env
notepad .env
```
Set `DB_PASSWORD` to your actual MySQL password. Do not upload `.env` to GitHub. The MySQL user must have permission to create the `ngo_db` database. The server creates `ngo_db`, `volunteers`, and `messages` if needed.

## Run
```bash
npm install
npm start
```
API: http://localhost:3000

## Endpoints
- `GET /api/health` — check API and database
- `POST /api/volunteers` — body: `{"name":"Asha Rao","email":"asha@example.com","interest":"Education"}`
- `POST /api/messages` — body: `{"name":"Asha Rao","email":"asha@example.com","message":"I would like to help."}`

This is a starter backend. Admin login/dashboard, donation records and payment processing are not included yet. Do not use the demo forms to collect payment details.