from flask import Blueprint, jsonify, request
from app import db
from app.models.student import Student

students_bp = Blueprint('students', __name__)

# GET all students
@students_bp.route('/', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students])

# POST add student
@students_bp.route('/add', methods=['POST'])
def add_student():
    data = request.json
    student = Student(
        name=data['name'],
        student_id=data['studentId'],
        email=data['email'],
        phone=data.get('phone', ''),
        class_name=data['className'],
        status=data.get('status', 'Active'),
        attendance=0
    )
    db.session.add(student)
    db.session.commit()
    return jsonify(student.to_dict()), 201

# DELETE student
@students_bp.route('/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get_or_404(id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

# PUT update student
@students_bp.route('/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get_or_404(id)
    data = request.json
    student.name = data.get('name', student.name)
    student.phone = data.get('phone', student.phone)
    student.class_name = data.get('className', student.class_name)
    student.status = data.get('status', student.status)
    db.session.commit()
    return jsonify(student.to_dict())