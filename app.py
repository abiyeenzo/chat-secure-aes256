from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')  # ton HTML

# Stocke la clé publique de chaque client
public_keys = {}

@socketio.on('public_key')
def handle_public_key(data):
    # Stocke la clé publique du client
    public_keys[request.sid] = data['key']
    # Envoie la clé publique à tous sauf l'expéditeur
    emit('public_key', {'key': data['key']}, broadcast=True, include_self=False)

@socketio.on('send_message')
def handle_message(data):
    # Transmet le message chiffré à tout le monde
    emit('receive_message', {'message': data['message'], 'nickname': data['nickname']}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
