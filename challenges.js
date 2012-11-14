var challenges = [
    {
        "Du kämpfst wie ein dummer Bauer!":["Wie passend, du kämpfst wie eine Kuh!"]
    },
    {
        "Menschen fallen mir zu Füßen, wenn ich komme!":["Auch bevor sie deinen Atem riechen?"]
    },
    {
        "Ich kenne einige Affen, die mehr drauf haben als du!":["Aha, du warst also beim letzten Familientreffen!"]
    },
    {
        "Meine Narbe im Gesicht stammt aus einem harten Kampf!":["Aha, mal wieder in der Nase gebohrt, wie?"]
    },
    {
        "Du hast die Manieren eines Bettlers!":["Ich wollte, dass du dich wie zuhause fühlst!"]
    },
    {
        "Mein Schwert wird dich aufspießen wie einen Schaschlik!":["Dann mach nicht damit rum wie mit einem Staubwedel!"]
    },
    {
        "Mit meinem Taschentuch werde ich dein Blut aufwischen!":["Also hast du doch den Job als Putze gekriegt!"]
    },
    {
        "Ich hatte mal einen Hund, der war klüger als du!":["Er muß dir das Fechten beigebracht haben!"]
    },
    {
        "Du bist kein echter Gegner für mein geschultes Hirn!":["Vielleicht solltest du es endlich mal benutzen?"]
    },
    {
        "Dein Schwert hat schon bessere Zeiten gesehen!":["Und du wirst deine rostige Klinge nie wieder sehen!"]
    },
    {
        "Niemand wird mich verlieren sehen, du auch nicht!":["Du kannst SO schnell davonlaufen?"]
    },
    {
        "Willst du hören, wie ich 3 Gegner zugleich besiegte?":["Willst du mich mit deinem Geschwafel ermüden?"]
    },
    {
        "Deine Fuchtelei hat nichts mit der Fechtkunst zu tun!":["Doch, doch, du hast sie nur nie gelernt."]
    },
    {
        "Trägst du immer noch Windeln?":["Wieso, die könntest DU viel eher gebrauchen!"]
    },
    {
        "An deiner Stelle würde ich zur Landratte werden!":["Hattest du das nicht vor kurzem getan?"]
    },
    {
        "Jeder hier kennt dich doch als unerfahrenen Dummkopf!":["Zu Schade, dass DICH überhaupt niemand kennt."]
    }
];

var attacks = [];
var answers = {};
for (var i = 0; i < challenges.length; ++i) {
    var challenge = challenges[i];
    for (var attack in challenge) {
        attacks.push(attack);
        answers[attack] = challenge[attack];
    }
}

exports = module.exports = {
    challenges: challenges,
    attacks: attacks,
    answers: answers
};
