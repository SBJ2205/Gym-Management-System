from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import current_user, login_required
from werkzeug.security import check_password_hash
from models import Trainer , Member, Payment, WorkoutPlan, DietPlan, Feedback , Attendance # Your SQLAlchemy model
from extensions import db  # Import db from extensions
from datetime import datetime

trainer_bp = Blueprint('trainer', __name__, url_prefix='/trainer')

@trainer_bp.route('/login', methods=['GET', 'POST'])
def trainer_login():
    if request.method == 'GET':
        return render_template('trainer_login.html')

    email = request.form.get("email")
    password = request.form.get("password")

    user = Trainer.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        session["trainer_id"] = user.trainer_id
        return redirect(url_for('trainer.trainer_dashboard') + '?login_success=true')
    
    flash('Invalid email or password', 'error')
    return redirect(url_for('trainer.trainer_login'))


@trainer_bp.route('/logout')
def logout():
    session.pop("trainer_id", None)
    session.clear()  # This ensures all session data including flashed messages are cleared
    return redirect(url_for('trainer.trainer_login'))

@trainer_bp.route('/dashboard')

def trainer_dashboard():
    # Get trainer_id from session instead of current_user
    trainer_id = session.get('trainer_id')
    
    if not trainer_id:
        flash('Please login first', 'error')
        return redirect(url_for('trainer.trainer_login'))
    
    # Get trainer from database
    trainer = Trainer.query.get(trainer_id)
    
    if not trainer:
        flash('Trainer not found', 'error')
        return redirect(url_for('trainer.trainer_login'))
    
    # Query all related data directly
    members = trainer.members  # Regular relationship
    
    # For ordered relationships, query the tables directly
    workout_plans = WorkoutPlan.query.filter_by(trainer_id=trainer.trainer_id)\
                          .order_by(WorkoutPlan.created_at.desc()).all()
    
    diet_plans = DietPlan.query.filter_by(trainer_id=trainer.trainer_id)\
                      .order_by(DietPlan.created_at.desc()).all()
    
    attendance_records = Attendance.query.filter_by(trainer_id=trainer.trainer_id)\
                              .order_by(Attendance.date.desc()).all()
    
    feedbacks = Feedback.query.filter_by(trainer_id=trainer.trainer_id)\
                      .order_by(Feedback.submitted_at.desc()).all()
    
    return render_template(
        'trainer_dashboard.html',
        trainer=trainer,
        members=members,
        workout_plans=workout_plans,
        diet_plans=diet_plans,
        attendance_records=attendance_records,
        feedbacks=feedbacks
    )

@trainer_bp.route('/create-workout-plan', methods=['POST'])

def create_workout_plan():
    trainer_id = session.get('trainer_id')
    member_id = request.form.get('member_id')
    plan_details = request.form.get('plan_details')
    
    if not all([trainer_id, member_id, plan_details]):
        flash('All fields are required', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Check if member belongs to this trainer
    member = Member.query.filter_by(member_id=member_id, trainer_id=trainer_id).first()
    if not member:
        flash('Member not found or not assigned to you', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Create new workout plan
    new_plan = WorkoutPlan(
        member_id=member_id,
        trainer_id=trainer_id,
        plan_details=plan_details
    )
    
    try:
        db.session.add(new_plan)
        db.session.commit()
        flash('Workout plan created successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Failed to create workout plan', 'error')
    
    return redirect(url_for('trainer.trainer_dashboard'))


@trainer_bp.route('/create-diet-plan', methods=['POST'])

def create_diet_plan():
    trainer_id = session.get('trainer_id')
    member_id = request.form.get('member_id')
    diet_details = request.form.get('diet_details')
    
    if not all([trainer_id, member_id, diet_details]):
        flash('All fields are required', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Check if member belongs to this trainer
    member = Member.query.filter_by(member_id=member_id, trainer_id=trainer_id).first()
    if not member:
        flash('Member not found or not assigned to you', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Create new diet plan
    new_plan = DietPlan(
        member_id=member_id,
        trainer_id=trainer_id,
        diet_details=diet_details
    )
    
    try:
        db.session.add(new_plan)
        db.session.commit()
        flash('Diet plan created successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Failed to create diet plan', 'error')
    
    return redirect(url_for('trainer.trainer_dashboard'))


@trainer_bp.route('/record-attendance', methods=['POST'])

def record_attendance():
    trainer_id = session.get('trainer_id')
    member_id = request.form.get('member_id')
    date_str = request.form.get('date')
    status = request.form.get('status')
    
    if not all([trainer_id, member_id, date_str, status]):
        flash('All fields are required', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        flash('Invalid date format', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Check if member belongs to this trainer
    member = Member.query.filter_by(member_id=member_id, trainer_id=trainer_id).first()
    if not member:
        flash('Member not found or not assigned to you', 'error')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Check if attendance already exists for this date
    existing = Attendance.query.filter_by(
        member_id=member_id,
        trainer_id=trainer_id,
        date=date
    ).first()
    
    if existing:
        flash('Attendance already recorded for this date', 'warning')
        return redirect(url_for('trainer.trainer_dashboard'))
    
    # Create new attendance record
    new_attendance = Attendance(
        member_id=member_id,
        trainer_id=trainer_id,
        date=date,
        status=status
    )
    
    try:
        db.session.add(new_attendance)
        db.session.commit()
        flash('Attendance recorded successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Failed to record attendance', 'error')
    
    return redirect(url_for('trainer.trainer_dashboard'))


@trainer_bp.route('/logout')
def trainer_logout():
    session.clear()
    flash('You have been logged out successfully', 'success')
    return redirect(url_for('trainer.trainer_login'))