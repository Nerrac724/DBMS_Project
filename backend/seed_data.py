from database import get_connection
from datetime import datetime, timedelta

def seed_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM movies")
        if cursor.fetchone()[0] > 0:
            print("Database already seeded")
            cursor.close()
            conn.close()
            return

        cursor.execute("""
            INSERT INTO theaters (name, location) VALUES
            ('Cinema Plaza', 'Downtown'),
            ('Mega Screen', 'Mall Center')
        """)
        conn.commit()

        cursor.execute("SELECT id FROM theaters")
        theater_ids = [row[0] for row in cursor.fetchall()]

        cursor.execute("""
            INSERT INTO screens (theater_id, name, total_seats) VALUES
            (%s, 'Screen A', 100),
            (%s, 'Screen B', 80)
        """, (theater_ids[0], theater_ids[1]))
        conn.commit()

        cursor.execute("SELECT id FROM screens")
        screen_ids = [row[0] for row in cursor.fetchall()]

        cursor.execute("""
            INSERT INTO movies (title, description, genre, duration, rating, poster_url) VALUES
            ('The Matrix', 'A computer hacker learns about the true nature of reality.', 'Sci-Fi', 136, 8.7, 'https://images.pexels.com/photos/7974/pexels-photo.jpg'),
            ('Inception', 'A skilled thief leads a team to plant an idea in someone\'s mind.', 'Sci-Fi', 148, 8.8, 'https://images.pexels.com/photos/7974/pexels-photo.jpg'),
            ('The Dark Knight', 'When Batman faces a criminal mastermind, chaos ensues.', 'Action', 152, 9.0, 'https://images.pexels.com/photos/7974/pexels-photo.jpg'),
            ('Interstellar', 'A team of astronauts travel to a distant galaxy to ensure human survival.', 'Sci-Fi', 169, 8.6, 'https://images.pexels.com/photos/7974/pexels-photo.jpg'),
            ('Pulp Fiction', 'Multiple interconnected stories of Los Angeles mobsters.', 'Drama', 154, 8.9, 'https://images.pexels.com/photos/7974/pexels-photo.jpg')
        """)
        conn.commit()

        cursor.execute("SELECT id FROM movies")
        movie_ids = [row[0] for row in cursor.fetchall()]

        now = datetime.now()
        shows_data = []
        for movie_id in movie_ids[:3]:
            for i in range(3):
                show_time = now + timedelta(days=i, hours=14 + (i % 2) * 6)
                shows_data.append((movie_id, screen_ids[0], show_time.strftime('%Y-%m-%d %H:%M:%S'), 12.50, 100))
                shows_data.append((movie_id, screen_ids[1], show_time.strftime('%Y-%m-%d %H:%M:%S'), 10.00, 80))

        for movie_id, screen_id, show_time, price, available in shows_data:
            cursor.execute("""
                INSERT INTO shows (movie_id, screen_id, show_time, price, available_seats)
                VALUES (%s, %s, %s, %s, %s)
            """, (movie_id, screen_id, show_time, price, available))

        conn.commit()

        cursor.execute("SELECT id FROM shows")
        show_ids = [row[0] for row in cursor.fetchall()]

        for show_id in show_ids:
            cursor.execute("SELECT s.total_seats FROM screens s JOIN shows sh ON s.id = sh.screen_id WHERE sh.id = %s", (show_id,))
            total_seats = cursor.fetchone()[0]

            for i in range(1, total_seats + 1):
                row = chr(65 + (i - 1) // 10)
                seat_num = (i - 1) % 10 + 1
                seat_number = f"{row}{seat_num}"
                cursor.execute("""
                    INSERT INTO seats (show_id, seat_number, is_booked)
                    VALUES (%s, %s, FALSE)
                """, (show_id, seat_number))

        conn.commit()
        cursor.close()
        conn.close()

        print("Database seeded successfully")
    except Exception as e:
        print(f"Error seeding database: {e}")
        raise

if __name__ == '__main__':
    seed_data()
