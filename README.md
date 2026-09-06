# AadhaarChat 2.0 — React + Express + MongoDB + Socket.IO

Secure messaging tied to 12-digit Aadhaar identity. No phone number. One Aadhaar = one account.

## Stack
- **Frontend**: React 19 + Vite + Tailwind CSS + React Router + socket.io-client + axios
- **Backend**: Express 5 + Socket.IO 4 + Mongoose 9 + JWT + bcryptjs
- **DB**: MongoDB 7
- **Infra**: Docker multi-stage build, docker-compose, Jenkins

## Run locally
```bash
# 1. env
cp server/.env.example server/.env  # then edit MONGO_URI and JWT_SECRET

# 2. backend
npm install
npm run dev:server   # http://localhost:5000

# 3. frontend (in another terminal)
npm --prefix client install
npm --prefix client run dev  # http://localhost:5173  (proxies /api to 5000)
```

Dev uses Vite proxy; production `server/server.js` serves `client/dist` statically.

## Docker
```bash
docker compose up --build -d
# app at http://localhost:5000 (React build served by Express)
```

## API
- POST /api/auth/register {name,aadhaar,password}
- POST /api/auth/login {aadhaar,password} -> {token,user}
- GET  /api/auth/me (Bearer token)
- GET  /api/users?search= (Bearer)
- GET  /api/messages/:receiverId (Bearer)
- GET  /api/health

Socket.IO auth via `auth: {token}` — events: sendMessage, receiveMessage, typing, onlineUsers
