from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///brews.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Model
class Brew(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bean = db.Column(db.String(100), nullable=False)
    method = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer)
    notes = db.Column(db.Text)

# Create DB
with app.app_context():
    db.create_all()

# API Routes
@app.route('/api/brews', methods=['GET'])
def get_brews():
    brews = Brew.query.all()
    return jsonify([{
        'id': b.id, 
        'bean': b.bean, 
        'method': b.method, 
        'rating': b.rating, 
        'notes': b.notes
    } for b in brews])

@app.route('/api/brews', methods=['POST'])
def add_brew():
    data = request.get_json()
    new_brew = Brew(
        bean=data['bean'], 
        method=data['method'], 
        rating=data.get('rating'), 
        notes=data.get('notes')
    )
    db.session.add(new_brew)
    db.session.commit()
    return jsonify({'message': 'Brew added'})

@app.route('/api/brews/<int:id>', methods=['PUT'])
def update_brew(id):
    brew = Brew.query.get(id)
    data = request.get_json()
    brew.bean = data['bean']
    brew.method = data['method']
    brew.rating = data.get('rating')
    brew.notes = data.get('notes')
    db.session.commit()
    return jsonify({'message': 'Brew updated'})

@app.route('/api/brews/<int:id>', methods=['DELETE'])
def delete_brew(id):
    brew = Brew.query.get(id)
    db.session.delete(brew)
    db.session.commit()
    return jsonify({'message': 'Brew deleted'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)