# from flask import Blueprint, request, jsonify, render_template, flash, redirect, url_for
# from werkzeug.security import generate_password_hash
# from app import db
# from models import User  # Import the User model

# auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# @auth_bp.route('/register', methods=['GET', 'POST'])
# def register():
#     if request.method == 'POST':
#         email = request.form['email']
#         password = request.form['password']
#         first_name = request.form['first_name']
#         last_name = request.form.get('last_name', '')
#         role = request.form['role']  # 'admin', 'trainer', or 'member'

#         if role not in ['admin', 'trainer', 'member']:
#             flash("Invalid role selected", "danger")
#             return redirect(url_for('auth.register'))

#         # Hash the password before saving
#         hashed_password = generate_password_hash(password)

#         new_user = User(email=email, password=hashed_password, first_name=first_name, last_name=last_name, role=role)
#         db.session.add(new_user)
#         db.session.commit()

#         flash("User registered successfully!", "success")
#         return redirect(url_for('auth.login'))  # Redirect to login after registration

#     return render_template('register.html')
