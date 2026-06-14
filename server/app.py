from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ✅ strict_slashes disable — redirect CORS error fix
app.url_map.strict_slashes = False

# ✅ CORS fix
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'attendx_secret')

# ✅ db create
db = SQLAlchemy(app)

# ✅ All Routes
from app.routes.auth import auth_bp
from app.routes.classes import classes_bp
from app.routes.students import students_bp
from app.routes.attendance import attendance_bp
from app.routes.face import face_bp

app.register_blueprint(auth_bp,       url_prefix='/api/auth')
app.register_blueprint(classes_bp,    url_prefix='/api/classes')
app.register_blueprint(students_bp,   url_prefix='/api/students')
app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
app.register_blueprint(face_bp,       url_prefix='/api/face')

@app.route('/api/health')
def health():
    return {'status': '✅ AttendX Backend Running!'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)