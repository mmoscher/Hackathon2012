var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

// Initialize challenges/attacks/answers:
var challenges = require('./challenges');

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

var START_HITPOINTS = 2;


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

function opponent(nick) {
    var fight = fightByNick[nick];
    return (fight.challenger == nick) ? fight.defendant :fight.challenger;
}

// Overall number of wins for user
var winsByNick = {};

// Socket.IO handle for each user
var clientsByNick = {};

// If fight is running, both users reference the same fight here
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
        var fighters = [];
        for (var n in clientsByNick) {
            list.push(n);
            if (fightByNick[n]) {
                fighters.push(n);
            }
        }
        client.emit('Users', enc({users: list, fighters: fighters}));
    });

    client.on('disconnect', function () {
        if (!nick) return;
        delete clientsByNick[nick];

        var fight = fightByNick[nick];
        if (fight) {
            var opp = opponent(nick);
            winsByNick[opp] += 1;
            cleanupFight(nick);
            client.broadcast.emit('Fight Ended', enc(fight));
            clientsByNick[opp].emit('Opponent Gave Up', enc(fight));
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
            clientsByNick[nick].emit('Fight Cancelled',
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
        var fight = fightByNick[nick];
        client.broadcast.emit('Fight Started', enc(fight));
        startAttack(fight);
    });

    // msg: {option: number}
    client.on('attack', function (msg) {
        var fight = fightByNick[nick];
        var attack = fight.attackOptions[dec(msg).option];
        fight.attack = attack;
        fight.answerOptions = pickAnswerOptions(attack);
        var opp = opponent(nick);
        clientsByNick[opp].emit('Choose Answer', enc({attack: attack, options: fight.answerOptions}));
    });

    client.on('respond', function (msg) {
        var fight = fightByNick[nick];
        var answer = fight.answerOptions[dec(msg).option];

        var defended = true;
        if (answer != challenges.answers[fight.attack]) {
            fight.hitpoints[nick] -= 1;
            defended = false;
        }
        var opp = opponent(nick);
        clientsByNick[opp].emit('Answer Result', enc({defended: defended, fight: fight}));
        clientsByNick[nick].emit('Answer Result', enc({defended: defended, fight: fight}));

        if (fight.hitpoints[nick] == 0) {
            winsByNick[opp] += 1;
            clientsByNick[opp].emit('Fight finished', enc(fight));
            clientsByNick[nick].emit('Fight finished', enc(fight));
        }
        else {
            fight.turn = nick;
            startAttack(fight);
        }
    });

    function startAttack(fight) {
        fight.attackOptions = pickRandom(3, challenges.attacks);
        console.log("Asking '" + fight.turn + "' to choose an attack!");
        clientsByNick[fight.turn].emit('Choose Attack', enc(fight));
    }

    function pickAnswerOptions(attack) {
        var attacks;
        var repick;
        do {
            repick = false;
            attacks = pickRandom(2, challenges.attacks);
            for (var i = 0; i < attacks.length; ++i) {
                if (attacks[i] == attack) {
                    repick = true;
                }
            }
        }
        while(repick);

        var pos = Math.floor(Math.random()*3);
        attacks.splice(pos, 0, attack);


        var answers = [];
        for (var i = 0; i < attacks.length; ++i) {
            answers.push(challenges.answers[attacks[i]][0]);
        }

        console.log("Answer options for attack '" + attack + "':" + answers);
        return answers;
    }

    function pickRandom(k, list) {
        var selection = [];
        var n = list.length;
        for (var i = 0; k > 0; ++i) {
            if (Math.random() < Math.round(k) / (n - i)) {
                --k;
                selection.push(list[i]);
            }
        }
        return selection;
    }
});


app.use(express.static(__dirname + '/static'));