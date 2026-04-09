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

    # User's high score (optional field, defaults to 0)
    high_score = db.Column(db.Integer, default=0)

    # String representation of the User object
    def __repr__(self):
        return f'<users_template {self.username}>'

# Define rss feeds model

class rss_feeds(db.Model):
    # RSS feed ID (primary key)
    id = db.Column(db.Integer, primary_key=True)

    # RSS feed's username
    username = db.Column(db.String(100), nullable=False)

    # RSS feed URL (required field, maximum 300 characters)
    rss_url = db.Column(db.String(300), nullable=False)

    # RSS feed author (required field, maximum 100 characters)
    rss_author = db.Column(db.String(100), nullable=False)

    # String representation of the RSS feed object
    def __repr__(self):
        return f'<rss_feeds {self.rss_url}>'

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
    selectedUsers = db.session.execute(db.select(users_template).filter_by(username='test')).scalars().all()
    print('Received login attempt for user:', loginUser, file=sys.stderr)

    hash = db.session.execute(func.crypt(passString, func.gen_salt('md5'))).scalars().all()
    passHash = db.session.execute(func.crypt(passString, selectedUsers[0].password)).scalars().all()

#    print('Computed hash for provided password:', hash[0] if hash else 'None', file=sys.stderr)
#    print('Stored hash for user:', selectedUsers[0].password if selectedUsers else 'None', file=sys.stderr)

    if selectedUsers and hash and passHash:
        if selectedUsers[0].password == passHash[0]:
            print('Login successful for user:', loginUser, file=sys.stderr)
            return jsonify({'message': 'Login successful'})
    print('Login failed for user:', loginUser, file=sys.stderr)
    return jsonify({'message': 'Invalid credentials'})

# Endpoint for user signup. This accepts a username/password pair and creates a new user in the database.
@app.route('/api/signup', methods=['POST'])
def signup():
    currentUsers = db.session.execute(db.select(users_template.username)).scalars().all()
    newUser = request.form['username']

    if (newUser in currentUsers):
        print('Signup failed for user:', newUser, '- username already exists', file=sys.stderr)
        return jsonify({'message': 'Signup failed: username already exists'})
    
    passString = request.form['password']
    hash = db.session.execute(func.crypt(passString, func.gen_salt('md5'))).scalars().all()
    print('Received signup attempt for user:', newUser, file=sys.stderr)

    if hash:
        new_user = users_template(username=newUser, password=hash[0])
        db.session.add(new_user)
        db.session.commit()
        print('Signup successful for user:', newUser, file=sys.stderr)
        users = db.session.execute(db.select(users_template)).scalars().all()
        return jsonify({'message': 'Signup successful'})
    
    print('Signup failed for user:', newUser, file=sys.stderr)
    return jsonify({'message': 'Signup failed'})

@app.route('/api/get_score', methods=['POST'])
def get_score():
    username = request.form['username']
    print('Received request for high score of user:', username, file=sys.stderr)
    user = db.session.execute(db.select(users_template).filter_by(username=username)).scalars().all()

    if user:
        print('User found for username:', username, '- high score:', user[0].high_score, file=sys.stderr)
        return jsonify({'message': f'{user[0].high_score}'})
    
    print('User not found for username:', username, file=sys.stderr)
    return jsonify({'message': 'User not found'})

@app.route('/api/set_score', methods=['POST'])
def set_score():
    username = request.form['username']
    high_score = request.form['high_score']
    print('Received request to set high score for user:', username, file=sys.stderr)
    user = db.session.execute(db.select(users_template).filter_by(username=username)).scalars().all()

    if user:
        user[0].high_score = high_score
        db.session.commit()
        print('High score updated for user:', username, '- new high score:', high_score, file=sys.stderr)
        return jsonify({'message': f'High score updated for user {username}'})
    
    print('User not found for username:', username, file=sys.stderr)
    return jsonify({'message': 'User not found'})

@app.route('/api/get_rss', methods=['POST'])
def get_rss():
    username = request.form['username']
    print('Received request for RSS feed of user:', username, file=sys.stderr)
    user = db.session.execute(db.select(users_template).filter_by(username=username)).scalars().all()

    if user:
        user = db.session.execute(db.select(rss_feeds).filter_by(username=username)).scalars().all()
        print('User found for username:', username, '- RSS feed URL:', user, file=sys.stderr)
        if (len(user) == 0):
            print('No RSS feed found for user:', username, file=sys.stderr)
            return jsonify({'message': 'None'})
        return jsonify({'message': f'{user}'})
    
    print('User not found for username:', username, file=sys.stderr)
    return jsonify({'message': 'User not found'})

@app.route('/api/set_rss', methods=['POST'])
def set_rss():
    username = request.form['username']
    rss_feed_url = request.form['rss_feed_url']
    rss_author = request.form['rss_author']
    print('Received request to set RSS feed for user:', username, 'to', rss_feed_url, file=sys.stderr)
    user = db.session.execute(db.select(users_template).filter_by(username=username)).scalars().all()

    if user:
        rss = db.session.execute(db.select(rss_feeds).filter_by(username=username)).scalars().all()
        if not rss:
            new_rss = rss_feeds(id=1, username=username, rss_url=rss_feed_url, rss_author=rss_author)
            db.session.add(new_rss)
            db.session.commit()
            print('RSS feed URL set for user:', username, '- RSS feed URL:', rss_feed_url, file=sys.stderr)
            return jsonify({'message': 'RSS feed URL set'})

        url_check = db.session.execute(db.select(rss_feeds).filter_by(username=username, rss_url=rss_feed_url)).scalars().all()
        if url_check:
            print('RSS feed URL already exists for user:', username, '- RSS feed URL:', rss_feed_url, file=sys.stderr)
            return jsonify({'message': 'RSS feed URL already exists'})
        
        new_rss = rss_feeds(username=username, rss_url=rss_feed_url, rss_author=rss_author)
        db.session.add(new_rss)
        db.session.commit()
        print('RSS feed URL added for user:', username, '- new RSS feed URL:', rss_feed_url, file=sys.stderr)
        return jsonify({'message': 'RSS feed URL updated'})
    
    print('User not found for username:', username, file=sys.stderr)
    return jsonify({'message': 'User not found'})

if __name__ == '__main__':
    app.run(debug=True)


