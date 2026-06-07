from flask import Blueprint, request, jsonify
from datetime import datetime

students_bp = Blueprint('students', __name__)

students_store = []

@students_bp.route('/', methods=['GET'])
def get_students():
    return jsonify(students_store), 200

@students_bp.route('/add', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    new_student = {
        'id': len(students_store) + 1,
        'name': data.get('name', ''),
        'studentId': data.get('studentId', ''),
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'className': data.get('className', ''),
        'status': data.get('status', 'Active'),
        'attendance': 0,
        'joinDate': datetime.now().strftime('%Y-%m-%d'),
        'photo': None
    }
    students_store.append(new_student)
    return jsonify(new_student), 201

@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    for i, s in enumerate(students_store):
        if s['id'] == student_id:
            students_store[i] = {**s, **data, 'id': student_id}
            return jsonify(students_store[i]), 200
    return jsonify({'message': 'Student not found'}), 404

@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    global students_store
    students_store = [s for s in students_store if s['id'] != student_id]
    return jsonify({'message': 'Deleted'}), 200