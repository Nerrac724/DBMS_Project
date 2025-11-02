from werkzeug.security import generate_password_hash, check_password_hash
from database import get_connection
from functools import wraps
from flask import request, jsonify
import jwt
from config import SECRET_KEY
from datetime import datetime, timedelta

def hash_password(password):
    return generate_password_hash(password)

def verify_password(password_hash, password):
    return check_password_hash(password_hash, password)

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except:
                return jsonify({'error': 'Invalid token format'}), 401

        if not token:
            return jsonify({'error': 'Missing token'}), 401

        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.user_id = user_id
        return f(*args, **kwargs)

    return decorated

def register_user(email, password):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return None, "Email already registered"

        password_hash = hash_password(password)
        cursor.execute(
            "INSERT INTO users (email, password_hash) VALUES (%s, %s)",
            (email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return user_id, None
    except Exception as e:
        return None, str(e)

def login_user(email, password):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return None, "Invalid email or password"

        if not verify_password(user[1], password):
            return None, "Invalid email or password"

        return user[0], None
    except Exception as e:
        return None, str(e)
