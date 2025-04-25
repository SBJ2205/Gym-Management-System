from flask import Blueprint, request, jsonify, session, redirect, url_for, flash, render_template, send_from_directory
from models import Admin, Member , Trainer, Payment, Attendance # Your SQLAlchemy Admin model
from extensions import db  # Import db from extensions
from werkzeug.security import check_password_hash, generate_password_hash
import traceback
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError  # For database integrity errors
from decimal import Decimal  # For proper monetary values
import logging
from sqlalchemy import func 


admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
logger = logging.getLogger(__name__)  # Add this line to create a logger

@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'GET':
        return render_template('admin_login.html')

    email = request.form.get("email")
    password = request.form.get("password")

    user = Admin.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        session["admin_id"] = user.admin_id
        return redirect(url_for('admin.admin_dashboard'))

    flash("Invalid email or password", "danger")
    return redirect(url_for('admin.admin_login'))

@admin_bp.route('/logout', methods=['GET', 'POST'])
def admin_logout():
    session.pop("admin_id", None)  # Remove session data
    return redirect(url_for('admin.admin_login'))  # Redirect to login page


@admin_bp.route('/dashboard')
def admin_dashboard():
    # Count total members
    total_members = db.session.query(func.count(Member.member_id)).scalar()

    # Count total trainers
    total_trainers = db.session.query(func.count(Trainer.trainer_id)).scalar()

    # Sum of completed payments (only those with 'Completed' status)
    total_payments = db.session.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.status == 'Completed').scalar()

    return render_template(
        'admin_dashboard.html',
        datetime=datetime,
        total_members=total_members,
        total_trainers=total_trainers,
        total_payments=total_payments
    )
    
@admin_bp.route('/add_member', methods=['POST'])
def add_member():
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({'success': False, 'error': 'Invalid JSON request'}), 400

        password = data.get("password")
        if not password:
            return jsonify({'success': False, 'error': 'Password is required'}), 400

        # Hash the password before storing
        hashed_password = generate_password_hash(password)

        # Create a new Member instance
        new_member = Member(
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            email=data.get('email', ''),
            password=hashed_password,  # Store the hashed password
            phone=data.get('phone', ''),
            membership_expiry=data.get('membership_expiry', ''),
            membership_plan=data.get('membership_plan', ''),
            trainer_id=int(data['trainer_id']) if data.get('trainer_id') else None,
            
            # New fields
            age=int(data['age']) if data.get('age') else None,
            gender=data.get('gender', ''),
            address=data.get('address', ''),
            emergency_contact=data.get('emergency_contact', '')
        )

        # Add to the database and commit
        db.session.add(new_member)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Member added successfully!'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

    
@admin_bp.route('/get_members', methods=['GET'])
def get_members():
    try:
        members = Member.query.all()  # Fetch members from DB
        
        if not members:
            print("⚠️ No members found in the database!")
            return jsonify([])  # Return an empty array (not an object)

        member_list = []

        for member in members:
            member_list.append({
                "id": member.member_id,
                "first_name": member.first_name,
                "last_name": member.last_name,
                "email": member.email,
                "phone": member.phone,
                "age": member.age if member.age else "N/A",
                "gender": member.gender if member.gender else "N/A",
                "address": member.address if member.address else "N/A",
                "emergency_contact": member.emergency_contact if member.emergency_contact else "N/A",
                "trainer_id": member.trainer_id if member.trainer_id else "Unassigned",
                "membership_expiry": member.membership_expiry.strftime('%Y-%m-%d') if member.membership_expiry else "N/A"
            })

        print("✅ Returning Data:", member_list)  # Debugging output
        return jsonify(member_list)  # ✅ Ensure we return an array

    except Exception as e:
        print(f"🔥 Server Error: {e}")  # Print error in the console
        return jsonify({"error": str(e)}), 500  # ❌ Ensure we return an object only for errors


# Get all trainers
@admin_bp.route('/get_trainers', methods=['GET'])
def get_trainers():
    trainers = Trainer.query.all()
    return jsonify([{
        'id': trainer.trainer_id,
        'first_name': trainer.first_name,
        'last_name': trainer.last_name,
        'email': trainer.email,
        'expertise': trainer.expertise,
        'availability': trainer.availability,
        'phone': trainer.phone_number,
        'certifications': trainer.certifications
    } for trainer in trainers])

# Get single trainer
@admin_bp.route('/get_trainer/<int:trainer_id>', methods=['GET'])
def get_trainer(trainer_id):
    trainer = Trainer.query.get_or_404(trainer_id)
    return jsonify({
        'id': trainer.trainer_id,
        'first_name': trainer.first_name,
        'last_name': trainer.last_name,
        'email': trainer.email,
        'expertise': trainer.expertise,
        'availability': trainer.availability,
        'phone_number': trainer.phone_number,
        'certifications': trainer.certifications
    })
        
@admin_bp.route("/add_trainer", methods=["POST"])
def add_trainer():
    data = request.json
    
    # Required fields validation
    required_fields = ['first_name', 'last_name', 'email', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"{field} is required"}), 400
    
    # Create trainer
    new_trainer = Trainer(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=generate_password_hash(data['password']),  # Don't forget to hash
        phone_number=data.get('phone_number'),
        expertise=data.get('expertise'),
        certifications=data.get('certifications'),
        availability=data.get('availability')
    )
    
    db.session.add(new_trainer)
    db.session.commit()
    
    return jsonify({"success": True, "trainer_id": new_trainer.trainer_id})

# Update trainer
@admin_bp.route('/update_trainer/<int:trainer_id>', methods=['PUT'])
def update_trainer(trainer_id):
    trainer = Trainer.query.get_or_404(trainer_id)
    data = request.get_json()
    
    trainer.first_name = data.get('first_name', trainer.first_name)
    trainer.last_name = data.get('last_name', trainer.last_name)
    trainer.email = data.get('email', trainer.email)
    trainer.phone_number = data.get('phone_number', trainer.phone_number)
    trainer.expertise = data.get('expertise', trainer.expertise)
    trainer.availability = data.get('availability', trainer.availability)
    trainer.certifications = data.get('certifications', trainer.certifications)
    
    db.session.commit()
    return jsonify({'success': True})

# Delete trainer
@admin_bp.route('/delete_trainer/<int:trainer_id>', methods=['DELETE'])
def delete_trainer(trainer_id):
    trainer = Trainer.query.get_or_404(trainer_id)
    db.session.delete(trainer)
    db.session.commit()
    return jsonify({'success': True})



@admin_bp.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@admin_bp.errorhandler(500)
def internal_error(error):
    print(traceback.format_exc())  # This prints the full error to the console
    return jsonify({"error": "Internal Server Error"}), 500


# Payments Routes
@admin_bp.route('/get_members_for_payments')
def get_members_for_payments():
    members = Member.query.all()
    return jsonify([{
        'id': member.member_id,
        'first_name': member.first_name,
        'last_name': member.last_name,
        'email': member.email
    } for member in members])

@admin_bp.route('/get_payments')
def get_payments():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    filter_type = request.args.get('filter', 'all')
    
    # Base query
    query = Payment.query.join(Member)
    
    # Apply search filter
    if search:
        query = query.filter(
            (Member.first_name.ilike(f'%{search}%')) |
            (Member.last_name.ilike(f'%{search}%')) |
            (Member.email.ilike(f'%{search}%')) |
            (Payment.id.ilike(f'%{search}%'))
        )
    
    # Apply time/status filter
    if filter_type == 'recent':
        thirty_days_ago = datetime.now() - timedelta(days=30)
        query = query.filter(Payment.payment_date >= thirty_days_ago)
    elif filter_type == 'pending':
        query = query.filter(Payment.status == 'Pending')
    elif filter_type == 'completed':
        query = query.filter(Payment.status == 'Completed')
    
    # Pagination
    pagination = query.paginate(page=page, per_page=10, error_out=False)
    payments = pagination.items
    
    return jsonify({
        'payments': [{
            'id': payment.payment_id,
            'member_name': f"{payment.member.first_name} {payment.member.last_name}",
            'amount': float(payment.amount),
            'payment_date': payment.payment_date.isoformat(),
            'status': payment.status,
            'payment_method': payment.payment_method,
            'notes': payment.notes
        } for payment in payments],
        'total_pages': pagination.pages
    })

@admin_bp.route('/get_payment/<int:payment_id>')
def get_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    return jsonify({
        'id': payment.payment_id,
        'member_name': f"{payment.member.first_name} {payment.member.last_name}",
        'amount': float(payment.amount),
        'payment_date': payment.payment_date.isoformat(),
        'status': payment.status,
        'payment_method': payment.payment_method,
        'notes': payment.notes
    })
    
@admin_bp.route('/record_payment', methods=['POST'])
def record_payment():
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({'success': False, 'error': 'Invalid JSON request'}), 400

        # Check required fields
        required_fields = ['member_id', 'amount', 'payment_method']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'success': False, 'error': f'{field} is required'}), 400

        # Validate data types
        try:
            member_id = int(data['member_id'])
            amount = Decimal(str(data['amount']))
            if amount <= 0:
                return jsonify({'success': False, 'error': 'Amount must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'Invalid amount or member ID format'}), 400

        # Verify member exists
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'success': False, 'error': 'Member not found'}), 404

        # Create and save payment
        new_payment = Payment(
            member_id=member_id,
            amount=amount,
            payment_method=data['payment_method'],
            status='Completed',
            payment_date=datetime.utcnow(),
            notes=data.get('notes')
        )
        
        db.session.add(new_payment)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Payment recorded successfully',
            'payment_id': new_payment.payment_id,
            'member_name': f"{member.first_name} {member.last_name}"
        })

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False, 
            'error': 'Database integrity error'
        }), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Payment processing failed',
            'details': str(e)
        }), 500
        
        
@admin_bp.route('/update_payment/<int:payment_id>', methods=['POST'])
def update_payment(payment_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        # Validate required fields
        required_fields = ['amount', 'payment_method', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing {field}'}), 400
        
        payment = Payment.query.get_or_404(payment_id)
        
        # Update payment fields
        payment.amount = Decimal(str(data['amount']))
        payment.payment_method = data['payment_method']
        payment.status = data['status']
        payment.notes = data.get('notes', payment.notes)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment updated successfully',
            'payment_id': payment.payment_id
        })
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Invalid amount format'}), 400
        
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Integrity error updating payment {payment_id}: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error'}), 500
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating payment {payment_id}: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error'}), 500
    
    
@admin_bp.route('/attendance', methods=['GET'])
def attendance_dashboard():
    return render_template('admin/attendance.html')

@admin_bp.route('/get_members_for_attendance', methods=['GET'])
def get_members_for_attendance():
    try:
        date = request.args.get('date', datetime.utcnow().date().isoformat())
        members = Member.query.all()
        
        member_list = []
        for member in members:
            attendance = Attendance.query.filter_by(
                member_id=member.member_id,
                date=date
            ).first()
            
            member_list.append({
                'member_id': member.member_id,
                'name': f"{member.first_name} {member.last_name}",
                'status': attendance.status if attendance else None,
                'check_in': attendance.check_in.isoformat() if attendance and attendance.check_in else None,
                'check_out': attendance.check_out.isoformat() if attendance and attendance.check_out else None
            })
            
        return jsonify({'success': True, 'members': member_list})
        
    except Exception as e:
        logger.error(f"Error fetching members for attendance: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/record_attendance', methods=['POST'])
def record_attendance():
    try:
        data = request.get_json()
        date = data.get('date', datetime.utcnow().date().isoformat())
        
        for record in data['attendance']:
            is_member = 'member_id' in record
            is_trainer = 'trainer_id' in record

            # Skip records with no ID
            if not is_member and not is_trainer:
                continue

            # Get existing record or create new
            if is_member:
                attendance = Attendance.query.filter_by(
                    member_id=record['member_id'],
                    date=date
                ).first() or Attendance(member_id=record['member_id'], date=date)
            else:
                attendance = Attendance.query.filter_by(
                    trainer_id=record['trainer_id'],
                    date=date
                ).first() or Attendance(trainer_id=record['trainer_id'], date=date)

            # Update fields only if they exist in the record
            if 'status' in record:
                attendance.status = record['status']
                
            # Handle check_in with validation
            if 'check_in' in record and record['check_in']:
                try:
                    attendance.check_in = datetime.fromisoformat(record['check_in'])
                except (ValueError, TypeError):
                    attendance.check_in = None
                    
            # Handle check_out with validation
            if 'check_out' in record and record['check_out']:
                try:
                    attendance.check_out = datetime.fromisoformat(record['check_out'])
                except (ValueError, TypeError):
                    attendance.check_out = None

            db.session.add(attendance)
                
        db.session.commit()
        return jsonify({'success': True, 'message': 'Attendance recorded successfully'})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error recording attendance: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/get_trainers_for_attendance', methods=['GET'])
def get_trainers_for_attendance():
    try:
        date = request.args.get('date', datetime.utcnow().date().isoformat())
        trainers = Trainer.query.all()
        
        trainer_list = []
        for trainer in trainers:
            attendance = Attendance.query.filter_by(
                trainer_id=trainer.trainer_id,
                date=date
            ).first()
            
            trainer_list.append({
                'trainer_id': trainer.trainer_id,
                'name': f"{trainer.first_name} {trainer.last_name}",
                'status': attendance.status if attendance else None,
                'check_in': attendance.check_in.isoformat() if attendance and attendance.check_in else None,
                'check_out': attendance.check_out.isoformat() if attendance and attendance.check_out else None
            })
            
        return jsonify({'success': True, 'trainers': trainer_list})
        
    except Exception as e:
        logger.error(f"Error fetching trainers for attendance: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500