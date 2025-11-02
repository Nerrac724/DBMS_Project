# Movie Booking System - Flask + MySQL Setup Guide

This project uses a Flask backend with MySQL database and a React frontend.

## Quick Start

### Prerequisites

1. **Python 3.8+** - https://www.python.org/
2. **MySQL Server** - https://www.mysql.com/downloads/
3. **Node.js 16+** - For frontend

### Step 1: Set Up Flask Backend

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure MySQL

Create a `.env` file in the `backend` directory:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=moviebooking
MYSQL_PORT=3306
SECRET_KEY=your-secret-key-for-production
```

Replace `your_mysql_root_password` with your actual MySQL root password.

### Step 3: Start Flask Server

```bash
cd backend
python app.py
```

The server will start at `http://localhost:5000`

### Step 4: Seed Sample Data (Optional)

In a new terminal:

```bash
cd backend
python seed_data.py
```

This adds 5 movies with multiple shows and theaters to the database.

### Step 5: Start React Frontend

In another terminal:

```bash
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`

## Database Structure

The application uses the following tables:

- **users** - User accounts with email/password
- **theaters** - Cinema locations
- **screens** - Theater screens with seat capacity
- **movies** - Movie information
- **shows** - Movie show times at specific screens
- **seats** - Individual seats in each show (booked/available)
- **bookings** - User bookings
- **booking_seats** - Seats associated with each booking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Movies
- `GET /api/movies` - Get all movies

### Shows
- `GET /api/shows?movie_id=1` - Get shows for a movie

### Seats
- `GET /api/seats/1` - Get seats for a show

### Bookings
- `POST /api/bookings` - Create a booking (requires auth token)

## Important Notes

- Flask backend must be running before starting the React frontend
- The frontend connects to `http://localhost:5000`
- Authentication uses JWT tokens stored in localStorage
- All seat bookings are stored in MySQL

## Troubleshooting

### Connection Refused Error
Make sure MySQL server is running and Flask is started before the frontend.

### MySQL Connection Error
Check your MySQL credentials in `.env` file. Ensure MySQL is running:
- Windows: Services > MySQL80 (or similar)
- Mac: Check System Preferences > MySQL
- Linux: `sudo service mysql start`

### Port Already in Use
- Flask: Change port in `backend/app.py` (default 5000)
- Frontend: Change port in `vite.config.ts` (default 5173)

## Development

- Frontend code: `src/` directory
- Backend code: `backend/` directory
- API client: `src/lib/api.ts`
- Components: `src/components/`

For production, ensure you update the API_BASE_URL in `src/lib/api.ts` and set a secure SECRET_KEY in `.env`.
