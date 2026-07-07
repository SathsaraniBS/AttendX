from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'attendx_secret')

# ✅ strict_slashes disable — trailing slash CORS redirect fix
app.url_map.strict_slashes = False

# ✅ CORS — origins from .env (production-ready)
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
    }
})

# ── Blueprints ─────────────────────────────────────────────────────────────────
from app.routes.auth       import auth_bp
from app.routes.classes    import classes_bp
from app.routes.students   import students_bp
from app.routes.attendance import attendance_bp
from app.routes.face       import face_bp

app.register_blueprint(auth_bp,       url_prefix='/api/auth')
app.register_blueprint(classes_bp,    url_prefix='/api/classes')
app.register_blueprint(students_bp,   url_prefix='/api/students')
app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
app.register_blueprint(face_bp,       url_prefix='/api/face')

# ── Health check ───────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({
        'status':  '✅ AttendX Backend Running!',
        'version': '1.0.0',
        'db':      os.getenv('DATABASE_URL', '').split('@')[-1] or 'not configured',
    })

# ── Notifications placeholder ──────────────────────────────────────────────────
# TODO: Create server/app/routes/notifications.py when ready
# For now returns empty list so Notifications.jsx doesn't crash
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    return jsonify([]), 200

# ── 404 handler ────────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404

# ── 500 handler ────────────────────────────────────────────────────────────────
@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ── 🔥 Warm up DeepFace model at startup (avoids slow first request) ──────────
def warm_up_model():
    try:
        from app.face_engine.recognizer import DeepFace, MODEL_NAME
        import numpy as np
        print("🔥 Warming up DeepFace model, please wait...")
        dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
        DeepFace.represent(
            img_path=dummy_img,
            model_name=MODEL_NAME,
            enforce_detection=False,
            detector_backend='opencv'
        )
        print("✅ DeepFace model warmed up and ready!")
    except Exception as e:
        print(f"⚠️ Model warm-up skipped: {e}")

# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("🚀 AttendX Backend Starting...")
    print(f"   CORS Origins : {ALLOWED_ORIGINS}")
    print(f"   Database     : {os.getenv('DATABASE_URL', 'NOT SET')}")
    print(f"   Port         : 5000")

    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        warm_up_model()

    app.run(debug=True, port=5000)