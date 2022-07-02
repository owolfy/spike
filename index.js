const express = require('express');
const path = require('path');
const indexRouter = require('./routes');
const websocket = require('./websocket');

const app = express();
const expressWs = require('express-ws')(app);

app.ws('/ws', function(ws, req) {
    websocket(expressWs, ws);
});
app.use(express.static(path.join(__dirname + '/public')));

app.use(express.json());
app.use('/', indexRouter);
app.listen(3000, () => {
    console.log(`Server Started at ${3000}`);
});