const socket = io();
let nickname = '';
const chatWindow = document.getElementById('chatWindow');

document.getElementById('btnLogin').onclick = () => {
    nickname = document.getElementById('nickname').value.trim();
    if (!nickname) {
        alert('Choisis un pseudo valide !');
        return;
    }
    document.getElementById('login').classList.add('hidden');
    document.getElementById('chat').classList.remove('hidden');
};

document.getElementById('btnSend').onclick = () => {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    socket.emit('send_message', {
        message: message,
        nickname: nickname
    });
    input.value = '';
};

socket.on('receive_message', data => {
    const { message, nickname: sender } = data;
    chatWindow.innerText += `[${sender}] ${message}\n`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
