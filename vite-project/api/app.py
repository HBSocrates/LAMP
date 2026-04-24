from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, JSON
from flask_migrate import Migrate
from flask_cors import CORS
import os, hashlib, sys, datetime
from dotenv import load_dotenv
# General skeleton/structure from Neon's Flask tutorial

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


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player1_username = db.Column(db.String(100), nullable=False)
    player2_username = db.Column(db.String(100), nullable=True)
    state_pieces = db.Column(JSON, nullable=False)
    current_player = db.Column(db.String(20), default='player1')
    winner = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default='waiting')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<Game {self.id} status={self.status}>'

# --- Game Logic Helpers ---

def get_size_value(size):
    size_map = {'small': 1, 'medium': 2, 'large': 3}
    return size_map.get(size, 0)

def get_top_piece_at_position(piece_list, x, y):
    top_pieces = [p for p in piece_list if p.get('placed') and p.get('boardPosition') and p['boardPosition']['x'] == x and p['boardPosition']['y'] == y]
    if not top_pieces:
        return None
    return max(top_pieces, key=lambda p: get_size_value(p.get('size', '')))

def check_winner(piece_list):
    win_lines = [
        [{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 0}],
        [{'x': 0, 'y': 1}, {'x': 1, 'y': 1}, {'x': 2, 'y': 1}],
        [{'x': 0, 'y': 2}, {'x': 1, 'y': 2}, {'x': 2, 'y': 2}],
        [{'x': 0, 'y': 0}, {'x': 0, 'y': 1}, {'x': 0, 'y': 2}],
        [{'x': 1, 'y': 0}, {'x': 1, 'y': 1}, {'x': 1, 'y': 2}],
        [{'x': 2, 'y': 0}, {'x': 2, 'y': 1}, {'x': 2, 'y': 2}],
        [{'x': 0, 'y': 0}, {'x': 1, 'y': 1}, {'x': 2, 'y': 2}],
        [{'x': 2, 'y': 0}, {'x': 1, 'y': 1}, {'x': 0, 'y': 2}],
    ]
    for line in win_lines:
        first_piece = get_top_piece_at_position(piece_list, line[0]['x'], line[0]['y'])
        if not first_piece:
            continue
        first_owner = first_piece['player']
        if all(get_top_piece_at_position(piece_list, cell['x'], cell['y']) and get_top_piece_at_position(piece_list, cell['x'], cell['y'])['player'] == first_owner for cell in line):
            return first_owner
    return None

def is_valid_placement(piece, x, y, piece_list):
    # Filter out the piece being moved
    others = [p for p in piece_list if p['id'] != piece['id']]
    top_piece = get_top_piece_at_position(others, x, y)
    return not top_piece or get_size_value(piece['size']) > get_size_value(top_piece['size'])

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

@app.route('/api/game/create', methods=['POST'])
def create_game():
    username = request.form.get('username')
    if not username:
        return jsonify({'message': 'Username is required'}), 400

    pieces = []
    for i in range(12):
        player_index = i % 6
        player = 'player1' if i < 6 else 'player2'
        size = 'small' if player_index < 2 else ('medium' if player_index < 4 else 'large')
        pieces.append({
            'id': i,
            'player': player,
            'x': (i % 3) * 120 + 10,
            'y': (i // 3) * 120 + 10,
            'placed': False,
            'boardPosition': None,
            'size': size
        })

    new_game = Game(
        player1_username=username,
        state_pieces=pieces,
        status='waiting',
        current_player='player1'
    )
    db.session.add(new_game)
    db.session.commit()
    return jsonify({'game_id': new_game.id, 'player_role': 'player1'})

@app.route('/api/game/join', methods=['POST'])
def join_game():
    game_id = request.form.get('game_id')
    username = request.form.get('username')
    if not game_id or not username:
        return jsonify({'message': 'Game ID and username are required'}), 400

    game = db.session.get(Game, game_id)
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    if game.status != 'waiting' or game.player2_username:
        return jsonify({'message': 'Game is already full or active'}), 400
    if game.player1_username == username:
        return jsonify({'message': 'You are already player 1'}), 400

    game.player2_username = username
    game.status = 'active'
    db.session.commit()
    return jsonify({'game_id': game.id, 'player_role': 'player2'})

@app.route('/api/game/state/<int:game_id>', methods=['GET'])
def get_game_state(game_id):
    game = db.session.get(Game, game_id)
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    return jsonify({
        'state_pieces': game.state_pieces,
        'current_player': game.current_player,
        'winner': game.winner,
        'status': game.status
    })

@app.route('/api/game/move', methods=['POST'])
def make_move():
    game_id = request.form.get('game_id')
    username = request.form.get('username')
    piece_id = request.form.get('piece_id', type=int)
    x = request.form.get('x', type=int)
    y = request.form.get('y', type=int)

    if not all([game_id, username, piece_id is not None, x is not None, y is not None]):
        return jsonify({'message': 'Missing move parameters'}), 400

    game = db.session.get(Game, game_id)
    if not game:
        return jsonify({'message': 'Game not found'}), 404

    expected_username = game.player1_username if game.current_player == 'player1' else game.player2_username
    if username != expected_username:
        return jsonify({'message': 'Not your turn'}), 403

    pieces = list(game.state_pieces)
    piece = next((p for p in pieces if p['id'] == piece_id), None)
    if not piece:
        return jsonify({'message': 'Piece not found'}), 400

    expected_player = 'player1' if game.current_player == 'player1' else 'player2'
    if piece['player'] != expected_player:
        return jsonify({'message': 'Cannot move opponent piece'}), 400

    if not is_valid_placement(piece, x, y, pieces):
        return jsonify({'message': 'Invalid move: piece too small to stack'}), 400

    piece['x'] = x * 100
    piece['y'] = y * 100
    piece['placed'] = True
    piece['boardPosition'] = {'x': x, 'y': y}

    game.state_pieces = pieces

    winner = check_winner(pieces)
    if winner:
        game.winner = game.player1_username if winner == 'player1' else game.player2_username
        game.status = 'finished'
    else:
        game.current_player = 'player2' if game.current_player == 'player1' else 'player1'

    db.session.commit()
    return jsonify({'success': True, 'new_state': game.state_pieces, 'current_player': game.current_player, 'winner': game.winner, 'status': game.status})


