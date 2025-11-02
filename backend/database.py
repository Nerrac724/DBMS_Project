import mysql.connector
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT

def get_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        port=MYSQL_PORT
    )

def init_database():
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT
        )
        cursor = conn.cursor()

        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE}")
        cursor.close()
        conn.close()

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS theaters (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS screens (
                id INT PRIMARY KEY AUTO_INCREMENT,
                theater_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                total_seats INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (theater_id) REFERENCES theaters(id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS movies (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                genre VARCHAR(100),
                duration INT,
                rating FLOAT,
                poster_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS shows (
                id INT PRIMARY KEY AUTO_INCREMENT,
                movie_id INT NOT NULL,
                screen_id INT NOT NULL,
                show_time DATETIME NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                available_seats INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (movie_id) REFERENCES movies(id),
                FOREIGN KEY (screen_id) REFERENCES screens(id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS seats (
                id INT PRIMARY KEY AUTO_INCREMENT,
                show_id INT NOT NULL,
                seat_number VARCHAR(10) NOT NULL,
                is_booked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (show_id) REFERENCES shows(id),
                UNIQUE KEY unique_seat (show_id, seat_number)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bookings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                show_id INT NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (show_id) REFERENCES shows(id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS booking_seats (
                id INT PRIMARY KEY AUTO_INCREMENT,
                booking_id INT NOT NULL,
                seat_id INT NOT NULL,
                FOREIGN KEY (booking_id) REFERENCES bookings(id),
                FOREIGN KEY (seat_id) REFERENCES seats(id)
            )
        ''')

        conn.commit()
        cursor.close()
        conn.close()

        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise
