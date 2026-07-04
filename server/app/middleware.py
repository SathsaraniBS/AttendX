from flask import request, jsonify
from functools import wraps
import jwt
import os


# ==================== TOKEN REQUIRED ====================
def token_required(f):
  
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # ✅ Authorization header check
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '').strip()

        if not token:
            return jsonify({'error': 'Access denied. Token required!'}), 401

        try:
            data = jwt.decode(
                token,
                os.getenv('SECRET_KEY', 'attendx_secret'),
                algorithms=['HS256']
            )
            request.current_user = data  
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired. Please login again!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token. Please login again!'}), 401

        return f(*args, **kwargs)
    return decorated


# ==================== ADMIN REQUIRED ====================
def admin_required(f):
   
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '').strip()

        if not token:
            return jsonify({'error': 'Access denied. Token required!'}), 401

        try:
            data = jwt.decode(
                token,
                os.getenv('SECRET_KEY', 'attendx_secret'),
                algorithms=['HS256']
            )
            if data.get('role') != 'admin':
                return jsonify({'error': 'Admin access required!'}), 403
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired. Please login again!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token. Please login again!'}), 401

        return f(*args, **kwargs)
    return decorated


# ==================== STUDENT REQUIRED ====================
def student_required(f):
    
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '').strip()

        if not token:
            return jsonify({'error': 'Access denied. Token required!'}), 401

        try:
            data = jwt.decode(
                token,
                os.getenv('SECRET_KEY', 'attendx_secret'),
                algorithms=['HS256']
            )
            if data.get('role') != 'student':
                return jsonify({'error': 'Student access required!'}), 403
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired. Please login again!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token. Please login again!'}), 401

        return f(*args, **kwargs)
    return decorated