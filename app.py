from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app)

# Historique des messages, chiffres en AES-256-GCM cote client avant envoi.
# Le serveur ne detient jamais la phrase secrete du salon : il relaie et
# stocke uniquement du texte chiffre (ciphertext + iv), jamais le clair.
message_history = []


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('connect')
def handle_connect():
    print('Client connecte:', request.sid)


@socketio.on('disconnect')
def handle_disconnect():
    print('Client deconnecte:', request.sid)


@socketio.on('new_user')
def handle_new_user(data):
    """Envoie l'historique chiffre au nouvel utilisateur (a decrypter localement)."""
    nickname = (data or {}).get('nickname', 'Anonyme')
    print(f"Envoi de l'historique chiffre a {nickname}: {len(message_history)} messages")
    emit('load_message_history', message_history)


@socketio.on('send_message')
def handle_message(data):
    nickname = data.get('nickname', 'Anonyme')
    ciphertext = data.get('ciphertext', '')
    iv = data.get('iv', '')

    if not ciphertext or not iv:
        return

    message_entry = {
        'ciphertext': ciphertext,
        'iv': iv,
        'nickname': nickname,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }
    message_history.append(message_entry)

    print(f"Message chiffre relaye de {nickname} ({len(ciphertext)} caracteres base64)")

    emit('receive_message', message_entry, broadcast=True, include_self=False)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
