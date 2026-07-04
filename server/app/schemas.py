from marshmallow import Schema, fields, validate, ValidationError


# ==================== AUTH SCHEMAS ====================
class LoginSchema(Schema):
    email    = fields.Email(required=True, error_messages={'required': 'Email required'})
    password = fields.Str(required=True, validate=validate.Length(min=4), error_messages={'required': 'Password required'})


class ChangePasswordSchema(Schema):
    email           = fields.Email(required=True)
    currentPassword = fields.Str(required=True, validate=validate.Length(min=4))
    newPassword     = fields.Str(required=True, validate=validate.Length(min=6,
                       error='Password must be at least 6 characters'))


# ==================== STUDENT SCHEMAS ====================
class AddStudentSchema(Schema):
    name      = fields.Str(required=True, validate=validate.Length(min=2, max=100),
                  error_messages={'required': 'Name required'})
    email     = fields.Email(required=True, error_messages={'required': 'Email required'})
    studentId = fields.Str(required=True, validate=validate.Length(min=2, max=20),
                  error_messages={'required': 'Student ID required'})
    className = fields.Str(required=True, error_messages={'required': 'Class required'})
    phone     = fields.Str(load_default='')
    status    = fields.Str(load_default='Active',
                  validate=validate.OneOf(['Active', 'Inactive', 'Suspended']))
    password  = fields.Str(load_default='')


class UpdateStudentSchema(Schema):
    name      = fields.Str(validate=validate.Length(min=2, max=100))
    email     = fields.Email()
    studentId = fields.Str(validate=validate.Length(min=2, max=20))
    className = fields.Str()
    phone     = fields.Str()
    status    = fields.Str(validate=validate.OneOf(['Active', 'Inactive', 'Suspended']))


# ==================== CLASS SCHEMAS ====================
class AddClassSchema(Schema):
    name     = fields.Str(required=True, validate=validate.Length(min=2, max=100),
                 error_messages={'required': 'Class name required'})
    code     = fields.Str(load_default='')
    teacher  = fields.Str(load_default='')
    schedule = fields.Str(load_default='')
    room     = fields.Str(load_default='')
    capacity = fields.Int(load_default=40, validate=validate.Range(min=1, max=500))
    status   = fields.Str(load_default='Active',
                 validate=validate.OneOf(['Active', 'Inactive']))


# ==================== ATTENDANCE SCHEMAS ====================
class MarkAttendanceSchema(Schema):
    studentId = fields.Int(required=True,  error_messages={'required': 'Student ID required'})
    date      = fields.Date(required=True, error_messages={'required': 'Date required'})
    status    = fields.Str(load_default='Present',
                  validate=validate.OneOf(['Present', 'Late', 'Absent']))
    time      = fields.Str(load_default=None)


class UpdateStatusSchema(Schema):
    status = fields.Str(required=True,
               validate=validate.OneOf(['Present', 'Late', 'Absent'],
               error='Status must be Present, Late, or Absent'))


# ==================== VALIDATION HELPER ====================
def validate_request(schema_class, data):
    """
    Request data validate කරන helper function.
    Returns: (validated_data, error_response)
    error_response is None if valid.

    Usage:
        data, error = validate_request(LoginSchema, request.get_json())
        if error: return error
    """
    schema = schema_class()
    try:
        validated = schema.load(data or {})
        return validated, None
    except ValidationError as err:
        # ✅ First error message return
        errors = err.messages
        first_field = next(iter(errors))
        first_msg   = errors[first_field][0] if isinstance(errors[first_field], list) else str(errors[first_field])
        from flask import jsonify
        return None, (jsonify({'error': first_msg, 'field': first_field}), 400)