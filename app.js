var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    challenges = require('challenges');

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

var START_HITPOINTS = 10;


// FIGHT MANAGEMENT
function startFight(challenger, defendant) {
    if (fightByNick[challenger] != null) {
        console.log("User " + challenger + " is already in battle: " + enc(fightByNick[challenger]))
        return null;
    }
    if (fightByNick[defendant] != null) {
        console.log("User " + defendant + " is already in battle: " + enc(fightByNick[defendant]))
        return null;
    }

    var hitpoints = {};
    hitpoints[challenger] = START_HITPOINTS;
    hitpoints[defendant] = START_HITPOINTS;
    var fight = {challenger: challenger,
                 defendant: defendant,
                 turn: challenger,
                 hitpoints: hitpoints};
    fightByNick[defendant] = fightByNick[challenger] = fight;
    return fight;
}

function cleanupFight(nick) {
    var fight = fightByNick[nick];
    delete fightByNick[fight.challenger];
    delete fightByNick[fight.defendant];
}

function opponent(nick, fight) {
    return (fight.challenger == nick) ? fight.defendant :fight.challenger;
}

var winsByNick = {};
var clientsByNick = {};
var fightByNick = {};

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
        statusByNick[nick] = {
            fight: null
            // {"challenger": "nick1', turn: "nick2", hitpoints: {"nick1": 10, "nick2":10}}
        };

        if (!winsByNick[nick]) {
            winsByNick[nick] = 0;
        }

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

        var fight = fightsByNick[nick];
        if (fight) {
            winsByNick[opponent(nick, fight)] += 1;
            cleanupFight(nick);
            // TODO: Send notification to winner....
        }
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
        var fight = startFight(nick, to);
        if (fight == null) {
            clientsByNick[from].emit('Fight Cancelled',
                                     enc({reason: "Opponent already in a fight."}))
        }
        else {
            clientsByNick[to].emit('Incoming Challenge', enc({from: nick}));
        }
    });

    client.on('challenge declined', function (msg) {
        var to = dec(msg).to;
        cleanupFight(nick);
        clientsByNick[from].emit(
            'Fight Cancelled',
            enc({reason: "Opponent has declined the challenge."}));
    });


    client.on('challenge accepted', function (msg) {
        
    });

});


app.use(express.static(__dirname + '/static'));