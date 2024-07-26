const socket = io();

const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio('/message-tone.mp3');

messageTone.addEventListener('canplaythrough', () => {
    console.log('Audio file is loaded and can be played.');
});

messageTone.addEventListener('error', (e) => {
    console.error('Error loading audio file:', e);
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Total Clients: ${data}`;
});

function getFormattedDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month} ${hours}:${minutes}`;
}

// Sending a message
function sendMessage() {
    if (messageInput.value === '') return;
    const now = new Date();
    const formattedDateTime = getFormattedDate(now);

    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: formattedDateTime
    };
    socket.emit('message', data);
    addMessageToUI(true, data);

    messageInput.value = '';
}

// Receiving a message
socket.on('chat-message', (data) => {
    console.log('Received chat message:', data);
    messageTone.play().catch((error) => {
        console.error('Error playing audio:', error);
    });
    addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
    clearFeedback();
    const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
        <p class="message">
            ${data.message}
            <span>${data.name} ⏺ ${data.dateTime}</span>
        </p>
    </li>
    `;
    messageContainer.innerHTML += element;
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Event listeners
messageInput.addEventListener('focus', (e) => {
    socket.emit('feedback', {
        feedback: `${nameInput.value} is typing a message`
    });
});

messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
        feedback: `${nameInput.value} is typing a message`
    });
});

messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
        feedback: ''
    });
});

socket.on('feedback', (data) => {
    clearFeedback();
    const element = `
        <li class="message-feedback">
            <p class="feedback" id="feedback">
                ${data.feedback}
            </p>
        </li>
    `;
    messageContainer.innerHTML += element;
});

function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach(element => {
        element.parentNode.removeChild(element);
    });
}
