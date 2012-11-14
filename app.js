var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(9001);


// Initialize Socket.IO
io.configure(function(){
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    io.set('log level', 1);
    io.set('transports', [
        'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
    ]);
});


function enc(object) { return JSON.stringify(object) }
function dec(str)  { return JSON.parse(str) }


var challenges = {
    "1":  {"FrageA": ["AntwortA1", "AntwortA2"]},
    "2":  {"FrageB": ["AntwortB1", "AntwortB2"]}
}

var clientsByNick = {};

io.of("/chat").on('connection', function (client) {
    // client.emit('welcome', { hello: 'world' });

    var nick;

    // HELPERS //////////////////////////////////////////////////////////////////////

    function clog(title, msg) {
        console.log("[Client] " + title + " " + enc(msg))
        client.emit('Log', enc({title: title, payload: msg}))
    }



    // LOGIN/LOGOUT /////////////////////////////////////////////////////////////////

    // Login
    // msg: {nick: username}
    client.on('login', function (msg) {
        nick = dec(msg).nick;

        if (clientsByNick[nick] != null) {
            client.emit('Nick Not Allowed', enc({nick: nick, reason: "Already taken!"}));
            return;
        }

        if (nick.length < 2) {
            client.emit('Nick Not Allowed', enc({nick: nick, reason: "Too short!"}));
            return;
        }

        client.set('nick', nick, function() {
            clientsByNick[nick] = client;
            client.emit('Login', msg);
            client.broadcast.emit('User Joined', msg);
        });

    });

    client.on('get users', function (msg) {
        var list = [];
        for (var c in clientsByNick) list.push(c);
        client.emit('Users', enc({users: list}));
    });

    client.on('disconnect', function () {
        if (!nick) return;
        delete clientsByNick[nick];
        client.broadcast.emit('User Left', enc({nick: nick}));
    });



    // CHAT ////////////////////////////////////////////////////////////////////////

    // Message to all players
    // msg: {text: message}
    client.on('say', function (msg) {
        var text = dec(msg).text;
        client.broadcast.emit('Message', enc({from: nick, text: text}));
    });

    // PM to specific user
    // msg: {to: nick, text: message}
    client.on('whisper', function (msg) {
        var to = dec(msg).to;
        var text = dec(msg).text;
        clientsByNick[to].emit('Private Message', enc({from: nick, text: text}));
    });


    // FIGHT ////////////////////////////////////////////////////////////////////////

    // Challenge a player!
    // msg: {to: nick}
    client.on('challenge', function (msg) {
        var to = dec(msg).to;
        clientsByNick[to].emit('Challenge Received', enc({from: nick, text: text}));
    });

});


app.use(express.static(__dirname + '/static'));