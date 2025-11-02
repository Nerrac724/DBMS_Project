from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_database, get_connection
from auth import register_user, login_user, token_required, generate_token, verify_token
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

init_database()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user_id, error = register_user(email, password)
    if error:
        return jsonify({'error': error}), 400

    token = generate_token(user_id)
    return jsonify({
        'user': {'id': user_id, 'email': email},
        'token': token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user_id, error = login_user(email, password)
    if error:
        return jsonify({'error': error}), 401

    token = generate_token(user_id)

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    email = cursor.fetchone()[0]
    cursor.close()
    conn.close()

    return jsonify({
        'user': {'id': user_id, 'email': email},
        'token': token
    }), 200

@app.route('/api/movies', methods=['GET'])
def get_movies():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM movies ORDER BY created_at DESC
        """)
        movies = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(movies), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shows', methods=['GET'])
def get_shows():
    movie_id = request.args.get('movie_id')

    if not movie_id:
        return jsonify({'error': 'movie_id required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                s.id, s.movie_id, s.screen_id, s.show_time,
                s.price, s.available_seats,
                sc.name as screen_name, sc.total_seats,
                t.id as theater_id, t.name as theater_name, t.location
            FROM shows s
            JOIN screens sc ON s.screen_id = sc.id
            JOIN theaters t ON sc.theater_id = t.id
            WHERE s.movie_id = %s
            ORDER BY s.show_time ASC
        """, (movie_id,))

        shows = cursor.fetchall()

        result = []
        for show in shows:
            result.append({
                'id': show['id'],
                'movie_id': show['movie_id'],
                'show_time': show['show_time'].isoformat(),
                'price': float(show['price']),
                'available_seats': show['available_seats'],
                'screen': {
                    'id': show['screen_id'],
                    'name': show['screen_name'],
                    'total_seats': show['total_seats'],
                    'theater': {
                        'id': show['theater_id'],
                        'name': show['theater_name'],
                        'location': show['location']
                    }
                }
            })

        cursor.close()
        conn.close()

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seats/<int:show_id>', methods=['GET'])
def get_seats(show_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM seats WHERE show_id = %s ORDER BY seat_number
        """, (show_id,))
        seats = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(seats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings', methods=['POST'])
@token_required
def create_booking():
    data = request.get_json()
    show_id = data.get('show_id')
    seat_ids = data.get('seat_ids', [])

    if not show_id or not seat_ids:
        return jsonify({'error': 'show_id and seat_ids required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT price FROM shows WHERE id = %s", (show_id,))
        show = cursor.fetchone()
        if not show:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Show not found'}), 404

        price = show[0]
        total_price = float(price) * len(seat_ids)

        cursor.execute(
            "INSERT INTO bookings (user_id, show_id, total_price) VALUES (%s, %s, %s)",
            (request.user_id, show_id, total_price)
        )
        booking_id = cursor.lastrowid

        for seat_id in seat_ids:
            cursor.execute(
                "INSERT INTO booking_seats (booking_id, seat_id) VALUES (%s, %s)",
                (booking_id, seat_id)
            )
            cursor.execute(
                "UPDATE seats SET is_booked = TRUE WHERE id = %s",
                (seat_id,)
            )

        cursor.execute(
            "UPDATE shows SET available_seats = available_seats - %s WHERE id = %s",
            (len(seat_ids), show_id)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'id': booking_id,
            'show_id': show_id,
            'total_price': total_price,
            'seat_ids': seat_ids
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
