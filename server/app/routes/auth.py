from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Test admin user
TEMP_ADMIN = {
    "email": "admin@attendx.com",
    "password": generate_password_hash("admin123"),
    "name": "Admin",
    "role": "admin"
}

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if email == TEMP_ADMIN['email'] and \
       check_password_hash(TEMP_ADMIN['password'], password):

        token = jwt.encode({
            'email': email,
            'name': TEMP_ADMIN['name'],
            'role': TEMP_ADMIN['role'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, os.getenv('SECRET_KEY', 'attendx_secret'), algorithm='HS256')

        return jsonify({
            'token': token,
            'name': TEMP_ADMIN['name'],
            'role': TEMP_ADMIN['role'],
            'message': 'Login successful!'
        }), 200

    return jsonify({'message': 'Invalid email or password'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return jsonify({'message': 'Registered successfully!'}), 201