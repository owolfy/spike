class Clients {
    constructor() {
        this.clientsList = {};
    }

    saveClient(username, client) {
        this.clientsList[username] = client;
    }

    renameClient(oldUsername, newUsername) {
        this.clientsList = Object.assign(this.clientsList, {[newUsername]: this.clientsList[oldUsername] });
        delete this.clientsList[oldUsername]
    }

    
    removeClient(username) {
        delete this.clientsList[username]
    }

}

let expressWs;
let ws;
const clients = new Clients();

function invokeWebSocket(expressWsRef, wsRef) {
    expressWs = expressWsRef;
    ws = wsRef;
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        handleMessageEvent(data);
    });
}

function handleMessageEvent(data) {
    let response = {username: data.username, action: data.action};
    switch (data.action) {
        case 'join':
            handleJoin(data, response);
            break;
        case 'leave':
            handleLeave(response);
            break;
        case 'message':
            handleMessage(data, response);
            break;
    }
}

function handleJoin(data, response) {
    if (data.username !== data.tempUsername && clients.clientsList[data.tempUsername]) {
        clients.renameClient(data.tempUsername, data.username)
    } else {
        clients.saveClient(data.username, ws);
    }
    response.users = Object.keys(clients.clientsList).map(username => username);
    broadcast(JSON.stringify(response));
}

function handleLeave(response) {
    broadcast(JSON.stringify(response));
    clients.removeClient(response.username)
}

function handleMessage(data, response) {
    response.message = data.message;
    response.date = data.date;
    broadcast(JSON.stringify(response));
}

function broadcast(data) {
    Object.keys(clients.clientsList).forEach((client) => {
        clients.clientsList[client].send(data);
    });
}

module.exports = invokeWebSocket;