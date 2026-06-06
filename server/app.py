from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'attendx_secret')

db = SQLAlchemy(app)

# Routes
from app.routes.auth import auth_bp
from app.routes.classes import classes_bp
from app.routes.students import students_bp        # ✅ NEW

app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(classes_bp,   url_prefix='/api/classes')
app.register_blueprint(students_bp,  url_prefix='/api/students')  # ✅ NEW

@app.route('/api/health')
def health():
    return {'status': '✅ AttendX Backend Running!'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)