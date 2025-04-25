# from flask_sqlalchemy import SQLAlchemy
from extensions import db  # ✅ Import the single db instance

# # Define db here to prevent circular import issues
# db = SQLAlchemy()
from datetime import datetime
# from app import db  # ✅ Use the `db` instance from app.py
# Admins Table
class Admin(db.Model):
    __tablename__ = 'admins'
    admin_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)  # Hashed password

# Trainers Table
class Trainer(db.Model):
    __tablename__ = 'trainers'
    trainer_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)  # Hashed password
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    expertise = db.Column(db.Text)
    certifications = db.Column(db.Text)
    availability = db.Column(db.String(50))  # Example: "Mon-Fri: 9 AM - 6 PM"
    phone_number = db.Column(db.String(15), unique=True, nullable=False)  # Optional, add if needed
    # workout_plans = db.relationship('WorkoutPlan', backref='trainer', lazy='dynamic')
    # diet_plans = db.relationship('DietPlan', backref='trainer', lazy='dynamic')
    # attendance_records = db.relationship('Attendance', backref='trainer', lazy='dynamic')
    # feedbacks = db.relationship('Feedback', backref='trainer', lazy='dynamic')
# Members Table
class Member(db.Model):
    __tablename__ = 'members'
    member_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)  # Hashed password
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    address = db.Column(db.Text)
    emergency_contact = db.Column(db.String(15))
    membership_plan = db.Column(db.String(100))
    membership_expiry = db.Column(db.Date)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id', ondelete="SET NULL"))

    trainer = db.relationship('Trainer', backref='members')

class Attendance(db.Model):
    __tablename__ = 'attendance'
    attendance_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.member_id', ondelete="CASCADE"))
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id', ondelete="CASCADE"))
    date = db.Column(db.Date, default=datetime.utcnow().date)
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Present')  # Present/Absent
    
    member = db.relationship('Member', backref='attendance_records')
    trainer = db.relationship('Trainer', backref='attendance_records')
    
# Payments Table
class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.member_id', ondelete="CASCADE"))
    amount = db.Column(db.Numeric(10,2))
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50))
    payment_method = db.Column(db.String(50))  # Example: "Credit Card", "UPI", "Cash"
    notes = db.Column(db.Text)  # Add this line
    member = db.relationship('Member', backref='payments')

# Feedback Table
class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    feedback_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.member_id', ondelete="CASCADE"))
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id', ondelete="SET NULL"))
    feedback_text = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    admin_response = db.Column(db.Text)

    member = db.relationship('Member', backref='feedbacks')
    trainer = db.relationship('Trainer', backref='feedbacks')

# Workout Plans Table
class WorkoutPlan(db.Model):
    __tablename__ = 'workout_plans'
    plan_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.member_id', ondelete="CASCADE"))
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id', ondelete="SET NULL"))
    plan_details = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    member = db.relationship('Member', backref='workout_plans')
    trainer = db.relationship('Trainer', backref='workout_plans')

# Diet Plans Table
class DietPlan(db.Model):
    __tablename__ = 'diet_plans'
    diet_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.member_id', ondelete="CASCADE"))
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id', ondelete="SET NULL"))
    diet_details = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    member = db.relationship('Member', backref='diet_plans')
    trainer = db.relationship('Trainer', backref='diet_plans')











# Class Bookings Table
class ClassBooking(db.Model):
    __tablename__ = 'class_bookings'
    booking_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.member_id', ondelete="CASCADE"))
    class_name = db.Column(db.String(100))
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.trainer_id', ondelete="SET NULL"))
    class_time = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='Booked')  # "Booked", "Cancelled", "Completed"

    member = db.relationship('Member', backref='class_bookings')
    trainer = db.relationship('Trainer', backref='class_bookings')

# Equipment Maintenance Table
class EquipmentMaintenance(db.Model):
    __tablename__ = 'equipment_maintenance'
    maintenance_id = db.Column(db.Integer, primary_key=True)
    equipment_name = db.Column(db.String(100), nullable=False)
    last_service_date = db.Column(db.Date)
    next_service_due = db.Column(db.Date)
    status = db.Column(db.String(50), default='Working')  # "Working", "Needs Repair", "Under Maintenance"















