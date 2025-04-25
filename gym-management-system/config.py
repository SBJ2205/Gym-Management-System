
import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key")  # Use env variable or default
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:sujal2205@localhost/gym_dbms'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
