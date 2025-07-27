from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app)

# Stocke la liste des clients connectés : { sid: { 'nickname': str, 'publicKey': str } }
clients = {}

# Stocke tous les messages en clair pour l'historique
# Format: {'message': plain_text, 'nickname': sender, 'timestamp': datetime}
message_history = []

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connecté:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in clients:
        nickname = clients[request.sid]['nickname']
        del clients[request.sid]
        print(f'Client déconnecté: {nickname} ({request.sid})')
    else:
        print('Client déconnecté:', request.sid)

@socketio.on('public_key')
def handle_public_key(data):
    # Stocke la clé publique associée au client
    clients[request.sid] = {
        'nickname': data['nickname'],
        'publicKey': data['publicKey']
    }
    
    print(f"Clé publique reçue pour {data['nickname']}")
    
    # Envoie la liste actualisée de toutes les clés publiques à tous les clients connectés
    all_keys = [
        {'nickname': c['nickname'], 'publicKey': c['publicKey']}
        for c in clients.values()
    ]
    emit('update_keys', all_keys, broadcast=True)

@socketio.on('new_user')
def handle_new_user():
    """Envoie l'historique complet des messages en clair au nouvel utilisateur"""
    sender_info = clients.get(request.sid, {})
    nickname = sender_info.get('nickname', 'Anonyme')
    
    print(f"Envoi de l'historique à {nickname}: {len(message_history)} messages")
    
    # Envoyer tout l'historique en clair
    emit('load_message_history', message_history)

@socketio.on('send_message')
def handle_message(data):
    # Récupère infos de l'expéditeur
    sender_info = clients.get(request.sid, {})
    nickname = sender_info.get('nickname', 'Anonyme')
    publicKey = sender_info.get('publicKey', '')
    
    # Le message arrive déjà en clair du client
    plain_message = data.get('message', '')
    
    # Stocker le message en clair dans l'historique
    message_entry = {
        'message': plain_message,
        'nickname': nickname,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }
    message_history.append(message_entry)
    
    print(f"Message de {nickname}: {plain_message}")
    
    # Transmettre le message en clair à tous les autres clients connectés
    emit('receive_message', {
        'message': plain_message,
        'nickname': nickname,
        'timestamp': message_entry['timestamp']
    }, broadcast=True, include_self=False)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
