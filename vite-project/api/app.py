from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_migrate import Migrate
from flask_cors import CORS
import os, hashlib, sys
from dotenv import load_dotenv
# General skeleton/structure from Neon's Flask tutorial

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure the database URI using the environment variable
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

# Disable SQLAlchemy modification tracking for better performance
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with the Flask app
db = SQLAlchemy(app)

# Initialize Flask-Migrate with the Flask app and SQLAlchemy instance
migrate = Migrate(app, db)

# Define the User model
class users_template(db.Model):
    # User's username (required field, maximum 100 characters)
    username = db.Column(db.String(100), nullable=False, primary_key=True)

    # User's password (required field, maximum 120 characters)
    password = db.Column(db.String(120), nullable=False)

    # String representation of the User object
    def __repr__(self):
        return f'<users_template {self.username}>'

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {
        'message': 'Hello from Flask!',
        'items': ['item1', 'item2', 'item3']
        }
    return jsonify(data)

# Endpoint for user login. This accepts a username/password pair and checks it against the database.
@app.route('/api/login', methods=['POST'])
def login():
    loginUser = request.form['username']
    passString = request.form['password']
    users = db.session.execute(db.select(users_template).filter_by(username='test')).scalars().all()
    print('Received login attempt for user:', loginUser, file=sys.stderr)
    hash = db.session.execute(func.crypt(passString, func.gen_salt('md5'))).scalars().all()
    passHash = db.session.execute(func.crypt(passString, users[0].password)).scalars().all()

#    print('Computed hash for provided password:', hash[0] if hash else 'None', file=sys.stderr)
#    print('Stored hash for user:', users[0].password if users else 'None', file=sys.stderr)

    if users and hash and passHash:
        if users[0].password == passHash[0]:
            print('Login successful for user:', loginUser, file=sys.stderr)
            return jsonify({'message': 'Login successful'})
    print('Login failed for user:', loginUser, file=sys.stderr)
    return jsonify({'message': 'Invalid credentials'})

# Endpoint for user signup. This accepts a username/password pair and creates a new user in the database.
@app.route('/api/signup', methods=['POST'])
def signup():
    newUser = request.form['username']
    passString = request.form['password']
    hash = db.session.execute(func.crypt(passString, func.gen_salt('md5'))).scalars().all()
    print('Received signup attempt for user:', newUser, file=sys.stderr)
    if hash:
        new_user = users_template(username=newUser, password=hash[0])
        db.session.add(new_user)
        db.session.commit()
        print('Signup successful for user:', newUser, file=sys.stderr)
        return jsonify({'message': 'Signup successful'})
    print('Signup failed for user:', newUser, file=sys.stderr)
    return jsonify({'message': 'Signup failed'})

if __name__ == '__main__':
    app.run(debug=True)


