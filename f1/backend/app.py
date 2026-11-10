from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
import os
from models import db, Driver, Constructor, Race, Result, Qualifying, DriverStanding, ConstructorStanding

app = Flask(__name__)

# Resolve the database relative to this file, so the server finds the same
# database no matter which directory it is started from.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'f1_2024.db')
os.makedirs(DATA_DIR, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + DB_PATH.replace(os.sep, '/')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app)

# API Routes

@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    """Get all drivers"""
    drivers = Driver.query.all()
    return jsonify([driver.to_dict() for driver in drivers])

@app.route('/api/drivers/<driver_id>', methods=['GET'])
def get_driver(driver_id):
    """Get specific driver by ID"""
    driver = db.get_or_404(Driver, driver_id)
    return jsonify(driver.to_dict())

@app.route('/api/constructors', methods=['GET'])
def get_constructors():
    """Get all constructors"""
    constructors = Constructor.query.all()
    return jsonify([constructor.to_dict() for constructor in constructors])

@app.route('/api/constructors/<constructor_id>', methods=['GET'])
def get_constructor(constructor_id):
    """Get specific constructor by ID"""
    constructor = db.get_or_404(Constructor, constructor_id)
    return jsonify(constructor.to_dict())

@app.route('/api/races', methods=['GET'])
def get_races():
    """Get all races"""
    races = Race.query.order_by(Race.round).all()
    return jsonify([race.to_dict() for race in races])

@app.route('/api/races/<int:race_id>', methods=['GET'])
def get_race(race_id):
    """Get specific race by ID"""
    race = db.get_or_404(Race, race_id)
    return jsonify(race.to_dict())

@app.route('/api/races/<int:race_id>/results', methods=['GET'])
def get_race_results(race_id):
    """Get results for a specific race"""
    results = Result.query.filter_by(race_id=race_id).order_by(Result.position).all()
    return jsonify([result.to_dict() for result in results])

@app.route('/api/races/<int:race_id>/qualifying', methods=['GET'])
def get_race_qualifying(race_id):
    """Get qualifying results for a specific race"""
    qualifying = Qualifying.query.filter_by(race_id=race_id).order_by(Qualifying.position).all()
    return jsonify([q.to_dict() for q in qualifying])

@app.route('/api/standings/drivers', methods=['GET'])
def get_driver_standings():
    """Get driver championship standings"""
    standings = DriverStanding.query.order_by(DriverStanding.position).all()
    return jsonify([standing.to_dict() for standing in standings])

@app.route('/api/standings/constructors', methods=['GET'])
def get_constructor_standings():
    """Get constructor championship standings"""
    standings = ConstructorStanding.query.order_by(ConstructorStanding.position).all()
    return jsonify([standing.to_dict() for standing in standings])

@app.route('/api/results', methods=['GET'])
def get_all_results():
    """Get race results, optionally filtered with ?driver_id= and/or ?constructor_id="""
    query = Result.query.join(Race)

    driver_id = request.args.get('driver_id')
    if driver_id:
        query = query.filter(Result.driver_id == driver_id)

    constructor_id = request.args.get('constructor_id')
    if constructor_id:
        query = query.filter(Result.constructor_id == constructor_id)

    results = query.order_by(Race.round, Result.position).all()
    return jsonify([result.to_dict() for result in results])

@app.route('/api/qualifying', methods=['GET'])
def get_all_qualifying():
    """Get all qualifying results"""
    qualifying = Qualifying.query.join(Race).order_by(Race.round, Qualifying.position).all()
    return jsonify([q.to_dict() for q in qualifying])

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'F1 2024 API is running',
        'endpoints': [
            '/api/drivers',
            '/api/drivers/<driver_id>',
            '/api/constructors',
            '/api/constructors/<constructor_id>',
            '/api/races',
            '/api/races/<race_id>',
            '/api/races/<race_id>/results',
            '/api/races/<race_id>/qualifying',
            '/api/standings/drivers',
            '/api/standings/constructors',
            '/api/results',
            '/api/qualifying'
        ]
    })

# Error handlers
@app.errorhandler(HTTPException)
def http_error(error):
    """Return HTTP errors (404, 405, ...) as JSON with their real status code"""
    message = 'Resource not found' if error.code == 404 else error.description
    return jsonify({'error': message}), error.code

@app.errorhandler(Exception)
def internal_error(error):
    """Log unexpected errors and return a generic message (no internals leaked)"""
    app.logger.exception('Unhandled error')
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Local-only and non-debug by default. Override with environment variables:
    #   FLASK_DEBUG=1   enable the reloader and interactive debugger
    #   FLASK_HOST=...  interface to bind (e.g. 0.0.0.0 to expose on the network)
    #   FLASK_PORT=...  port to listen on
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    host = os.environ.get('FLASK_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_PORT', '5000'))

    print(f"Database path: {DB_PATH}")

    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        if Race.query.count() == 0:
            print("WARNING: the database is empty. "
                  "Run notebooks/01_database_setup.ipynb to populate it.")

    print("F1 2024 API Server Starting...")
    print(f"Health check and endpoint list: http://{host}:{port}/api/health")

    app.run(debug=debug, host=host, port=port)
