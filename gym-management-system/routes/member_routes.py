from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from models import Member , Payment, WorkoutPlan, DietPlan, Feedback , Attendance # Your SQLAlchemy model
from extensions import db  # Import db from extensions

member_bp = Blueprint('member', __name__, url_prefix='/member')

@member_bp.route('/login', methods=['GET', 'POST'])
def member_login():
    if request.method == 'GET':
        return render_template('member_login.html')

    email = request.form.get("email")
    password = request.form.get("password")

    user = Member.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        session["member_id"] = user.member_id
        return redirect(url_for('member.member_dashboard') + '?login_success=true')
    
    flash('Invalid email or password', 'error')
    return redirect(url_for('member.member_login'))


@member_bp.route('/logout')
def logout():
    session.pop("member_id", None)
    session.clear()  # This ensures all session data including flashed messages are cleared
    return redirect(url_for('member.member_login'))


@member_bp.route('/dashboard')
def member_dashboard():
    member_id = session.get("member_id")

    if not member_id:
        flash("Please log in first", "warning")
        return redirect(url_for('member.member_login'))

    member = Member.query.get(member_id)
    if not member:
        flash("Member not found", "danger")
        return redirect(url_for('member.member_login'))

    payments = Payment.query.filter_by(member_id=member_id).all()
    workout_plans = WorkoutPlan.query.filter_by(member_id=member_id).all()
    diet_plans = DietPlan.query.filter_by(member_id=member_id).all()
    attendance_records = Attendance.query.filter_by(member_id=member_id).order_by(Attendance.date.desc()).all()

    return render_template('member_dashboard.html',
                           member=member,
                           payments=payments,
                           workout_plans=workout_plans,
                           diet_plans=diet_plans,
                           attendance_records=attendance_records)



@member_bp.route('/send-feedback', methods=['POST'])
def send_feedback():
    member_id = session.get("member_id")
    if not member_id:
        flash("Please log in first", "warning")
        return redirect(url_for('member.member_login'))

    feedback_text = request.form.get('feedback_text')
    member = Member.query.get(member_id)

    if not member:
        flash("Member not found", "danger")
        return redirect(url_for('member.member_dashboard'))

    feedback = Feedback(member_id=member_id,
                        trainer_id=member.trainer_id,  # Optional
                        feedback_text=feedback_text)

    db.session.add(feedback)
    db.session.commit()

    flash("Feedback submitted successfully", "success")
    return redirect(url_for('member.member_dashboard'))
