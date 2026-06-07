from app import db
from datetime import date


class Student(db.Model):
    __tablename__ = 'students'

    id         = db.Column(db.Integer,     primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(20),  unique=True, nullable=False)
    email      = db.Column(db.String(100), unique=True, nullable=False)
    phone      = db.Column(db.String(15))
    class_name = db.Column(db.String(50))
    status     = db.Column(db.String(20),  default='Active')
    attendance = db.Column(db.Integer,     default=0)
    join_date  = db.Column(db.Date,        default=date.today)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'studentId':  self.student_id,
            'email':      self.email,
            'phone':      self.phone or '',
            'className':  self.class_name or '',
            'status':     self.status or 'Active',
            'attendance': self.attendance or 0,
            'joinDate':   str(self.join_date) if self.join_date else '',
        }