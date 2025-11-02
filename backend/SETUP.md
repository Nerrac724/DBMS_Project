# Flask Backend Setup Guide

## Prerequisites

1. **MySQL Server** - Install from https://www.mysql.com/downloads/
2. **Python 3.8+** - Install from https://www.python.org/

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure MySQL Connection

Create a `.env` file in the `backend` directory:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=moviebooking
MYSQL_PORT=3306
SECRET_KEY=your-secret-key-change-in-production
```

Replace `your_mysql_password` with your MySQL root password.

### 3. Initialize Database

Run the Flask app once to initialize the database schema:

```bash
python app.py
```

This will create all necessary tables in MySQL.

### 4. Seed Sample Data

In another terminal (while Flask is running or after stopping it):

```bash
python seed_data.py
```

### 5. Start the Backend

```bash
python app.py
```

The Flask server will run on `http://localhost:5000`

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

## Notes

- The backend runs on port 5000 and the frontend connects to it
- All database operations use the MySQL database configured in `.env`
- Authentication uses JWT tokens
- CORS is enabled for frontend communication
