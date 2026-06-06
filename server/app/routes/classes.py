from flask import Blueprint, request, jsonify
from datetime import datetime

classes_bp = Blueprint('classes', __name__)

classes_store = []

@classes_bp.route('/', methods=['GET'])
def get_classes():
    return jsonify(classes_store), 200

@classes_bp.route('/', methods=['POST'])
def add_class():
    data = request.get_json()
    new_class = {
        'id': len(classes_store) + 1,
        'name': data.get('name', ''),
        'code': data.get('code', ''),
        'teacher': data.get('teacher', ''),
        'schedule': data.get('schedule', ''),
        'room': data.get('room', ''),
        'capacity': int(data.get('capacity', 0)),
        'status': data.get('status', 'Active'),
        'enrolled': 0,
        'attendance': 0,
        'created_at': datetime.now().isoformat()
    }
    classes_store.append(new_class)
    return jsonify(new_class), 201

@classes_bp.route('/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    data = request.get_json()
    for i, cls in enumerate(classes_store):
        if cls['id'] == class_id:
            classes_store[i] = {**cls, **data, 'id': class_id}
            return jsonify(classes_store[i]), 200
    return jsonify({'message': 'Class not found'}), 404

@classes_bp.route('/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    global classes_store
    classes_store = [c for c in classes_store if c['id'] != class_id]
    return jsonify({'message': 'Deleted'}), 200