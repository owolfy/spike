var socket;
var messageHistory = [];
var usersList = [];
var tempUsername = `guest-${Math.floor(Math.random() * 100)}`;
var username = tempUsername;

var form = document.getElementById("form");
var sendButton = document.getElementById("send-button");
var input = document.getElementById("input");

var onJoinEventListener;
var onLeaveEventListener = window.addEventListener('beforeunload', leaveServer);
var formEventListener = form.addEventListener("submit", formSend);
var sendButtonEventListener = sendButton.addEventListener("click", handleInput);

function formSend(e) {
    e.preventDefault();
    handleInput();
}

function enterPressed(e) {
    if (e.key === 'Enter') {
        handleInput();
      }
}

function handleInput() {
    var value = input.value.trim();
    if (value.length === 0) {
        return;
    }
    input.value = '';
    if (username === tempUsername) {
        username = value;
        joinServer();
        document.getElementsByName('input-field')[0].placeholder = 'Enter text here...';
        return;
    }
    sendMessage(value);
    
}

function receiveMessage(data) {
    if (data.action === 'join') {
        addUsersToList(data.users);
        return;
    }
    if (data.action === 'leave') {
        removeUserFromList(data.username);
        return;
    }
    addMessageToChat(data);
    messageHistory.push(messageHistory);
}

function sendMessage(message) {
    var data = {
        action: 'message',
        username,
        message,
        date: new Date()
    }
    socket.send(JSON.stringify(data));
}

function addUsersToList(users) {
    users.forEach(user => {
        if (!user.includes('guest-') && -1 === usersList.indexOf(user)) {
            usersList.push(user);
            addUserToUsersList(user)
        }
    })
}

function addUserToUsersList(name) {
    var container = document.createElement('li');
    container.className = 'clearfix';
    container.id = `username-${name}`;
    var outerUsernameWrapper = document.createElement('div');
    outerUsernameWrapper.className = 'about';
    var innerUsernameWrapper = document.createElement('div');
    innerUsernameWrapper.className = 'name';
    innerUsernameWrapper.innerText = name;
    container.appendChild(outerUsernameWrapper).appendChild(innerUsernameWrapper);
    document.getElementById('users-list').appendChild(container);
}

function removeUserFromList(name) {
    var index = usersList.indexOf(name);
    if (-1 === index) {
        return;
    }
    usersList.splice(index, 1);
    document.getElementById(`username-${name}`).remove();
}

function getLocaleDate(date) {
    var locale = new Date(date);
    var minutes = locale.getMinutes(); 
    var hour = locale.getHours();
    var seconds = locale.getSeconds();
    return `${hour}:${minutes}:${seconds}`;
}

function addMessageToChat(data) {
    var container = document.createElement('li');
    container.className = 'clearfix';
    container.id = `message-${messageHistory.length}`;
    var messageContainer = document.createElement('div');
    messageContainer.className = data.username === username ? 'message my-message float-right' : 'message other-message';

    if (data.username !== username) {
        var usernameWrapper = document.createElement('span');
        usernameWrapper.className = 'message-data-username';
        usernameWrapper.innerText = data.username;
        messageContainer.append(usernameWrapper);
    }

    var messageWrapper = document.createElement('div');
    messageWrapper.innerText = data.message;
    messageContainer.append(messageWrapper);


    var dateWrapper = document.createElement('span');
    dateWrapper.className = 'message-data-time';
    dateWrapper.innerText = `${getLocaleDate(data.date)} `;
    messageContainer.append(dateWrapper);
    container.append(messageContainer);
    var observer = new MutationObserver(function(mutations) {
        if (document.getElementById('messages-list').contains(container)) {
            container.scrollIntoView({ block: 'end',  behavior: 'smooth' });
            observer.disconnect();
        }
    });
    observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});
    document.getElementById('messages-list').appendChild(container);
}

function joinServer() {
    socket.send(JSON.stringify({username, action: 'join', tempUsername}));
}

function leaveServer() {
    socket.send(JSON.stringify({username, action: 'leave'}));
    onLeaveEventListener.removeEventListener('beforeunload', leaveServer);
    onJoinEventListener.removeEventListener('open', joinServer);
    formEventListener.removeEventListener('submit', handleInput);
    sendButtonEventListener.removeEventListener('click', handleInput);
}

(function connectToWebSocket() {
    socket = new WebSocket("ws://localhost:3000/ws");
    onJoinEventListener = socket.addEventListener('open', joinServer);
    socket.onmessage = (event) => {
        receiveMessage(JSON.parse(event.data));
    };
})();