# Project Management Frontend

## Local Setup

### 1. Install dependencies

npm install

### 2. Set up environment variables

create .env

VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000


### 3. Run the dev server

npm run dev


### 4. Build for production

npm run build


## Connecting to the backend
Make sure the backend's `CLIENT_URL` environment variable matches wherever this frontend is running (`http://localhost:5173` for local dev, or your deployed frontend URL in production) — otherwise API requests will fail with a CORS error.

