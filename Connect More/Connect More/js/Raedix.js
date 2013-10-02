var

RaedixLogin = {
    nodes : {
        test  : document.getElementsByClassName('test'),
        self  : document.getElementById('raedix-login'),
        login : {
            block    : document.getElementById('login-block'),
            username : document.getElementById('login-block').children[0],
            password : document.getElementById('login-block').children[1],
        },
        register : {
            block     : document.getElementById('register-block'),
            email     : document.getElementById('register-block').children[0],
            username  : document.getElementById('register-block').children[1],
            password  : document.getElementById('register-block').children[2],
            cpassword : document.getElementById('register-block').children[3],
        },
    },
    showView : function(){
        setTimeout(function(){RaedixLogin.nodes.self.className = "";}, 0);
        setTimeout(function(){RaedixLogin.nodes.self.className = "faded-in";}, 5);
    },
    hideView : function(){
        setTimeout(function(){RaedixLogin.nodes.self.className = "";}, 0);
        setTimeout(function(){RaedixLogin.nodes.self.className = "hidden";}, 505);
    },
    events : function(event){
        var element = event.target;

        switch (element.id) {
            case 'login-button':
                Raedix
                    .initialize()
                    .setLogin(
                        RaedixLogin.nodes.login.username.value,
                        RaedixLogin.nodes.login.password.value,
                        '001')
                    .sendLogin();
                return;

            case 'register-button':
                Raedix
                    .initialize()
                    .setRegister(
                        RaedixLogin.nodes.register.username.value,
                        RaedixLogin.nodes.register.email.value,
                        RaedixLogin.nodes.register.password.value)
                    .sendRegister();
                return;
            case 'login-toggle':
                RaedixLogin.nodes.register.block.className = "block rotated ease-in";
                setTimeout(function(){
                    RaedixLogin.nodes.login.block.className = "block ease-out";
                }, 300);
                return;

            case 'register-toggle':
                RaedixLogin.nodes.login.block.className = "block rotated ease-in";
                setTimeout(function(){
                    RaedixLogin.nodes.register.block.className = "block ease-out";
                }, 300);
                return;

            case 'back':
            case 'triangle-left':
                RaedixLogin.nodes.self.className = "";
                setTimeout(function(){RaedixLogin.nodes.self.className = "hidden";}, 500);
                setTimeout(function(){
                    Nodes.board.className = "faded-out";
                    setTimeout(function(){
                        Nodes.board.className = "";
                    }, 10);
                }, 500);
                return;
        }
    },
},

Raedix = {
    key               : null,
    bf                : null,
    token             : null,
    gametoken         : null,
    login             : {},
    register          : {},
    matchmaking       : {},
    cipherLogin       : null,
    cipherRegister    : null,
    cipherMatchmaking : null,
    cipherMatch       : null,
    gameData          : null,

    initialize : function(){
        jQuery.ajaxSetup({async:false});

        $.get("http://raedixgames.com/requestkey")
        .done(function(data){
            Raedix.bf = new Blowfish(data.key);
        }, 'json');

        return Raedix;
    },

    setLogin : function(username, password, gameid){
        this.login.username = username;
        this.login.password = password;
        this.login.gameid   = gameid;

        this.cipherLogin = this.bf.encrypt(JSON.stringify(this.login));

        this.login = {};

        return Raedix;
    },

    setRegister : function(username, email, password){
        this.register.username = username;
        this.register.email    = email;
        this.register.password = password;

        this.cipherRegister = this.bf.encrypt(JSON.stringify(this.register));

        this.register = {};

        return Raedix;
    },

    setMatchmaking : function(gameid, numPlayers){
        this.matchmaking.token         = this.token;
        this.matchmaking.gameid        = gameid;
        this.matchmaking.numberplayers = numPlayers;

        this.cipherMatchmaking = this.bf.encrypt(JSON.stringify(this.matchmaking));

        return Raedix;
    },

    sendLogin : function(){
        $.post("http://raedixgames.com/login", {encdata:this.cipherLogin})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            if (data.result === 'Fail') {
                console.log(data.error);
            }
            Raedix.token = data.token;
            console.log(Raedix.token);
        }, 'json');

        return Raedix;
    },

    sendRegister : function(){
        // Register an account. All data should be encrypted and sent via encdata object
        $.post("http://raedixgames.com/register", {encdata:this.cipherRegister})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            console.log(data);
        }, 'json');
        console.log(data);

        return Raedix;
    },

    sendMatchmaking : function(){
        $.post("http://raedixgames.com/joinmatchmaking", {encdata:this.cipherMatchmaking})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            console.log(data);
            Raedix.matchtoken = data.matchtoken;
        }, 'json');

        this.cipherMatch = this.bf.encrypt(JSON.stringify({'matchtoken':this.matchtoken}));

        return Raedix;
    },

    sendMove : function(gametoken, board){
        cipherData = {'gametoken': gametoken, 'board': board, 'token': raedix.token};
        cipherData = Raedix.bf.encrypt(JSON.stringify(cipherData));
        $.post("http://raedixgames.com/makemove", {encdata:cipherData})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            if (data.winner !== "") {
                Raedix.gameData.winner = data.winner;
            } else {
                Raedix.gameData.currentplayer = data.currentplayer;
            }
            console.log(data);
        }, 'json');

        return Raedix;
    },

    checkMatchmaking : function(){
        $.post("http://raedixgames.com/checkmatchmaking", {encdata:this.cipherMatch})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            if (data.result == 'Success') {
                Raedix.gametoken = data.gametoken;
            }
            console.log(data);
        }, 'json');

        return Raedix;
    },
    getGame : function(gametoken){
        cipherData = {'gametoken': gametoken};
        cipherData = Raedix.bf.encrypt(JSON.stringify(cipherData));
        $.post("http://raedixgames.com/getgame", {encdata:cipherData})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            if (data.result == 'Success') {
                Raedix.gameData = data;
            }
            console.log(data);
        }, 'json');

        return Raedix;
    },
    endGame : function(gametoken, token, winner){
        cipherData = {'gametoken': gametoken, 'token': token, 'winner': winner};
        cipherData = Raedix.bf.encrypt(JSON.stringify(cipherData));
        $.post("http://raedixgames.com/endgame", {encdata:cipherData})
        .done(function(data){
            data = Raedix.bf.decrypt(data.encdata); // decrypts encdata and makes it the default data object
            console.log(data);
            try {data = JSON.parse(data);}
            catch(err){
              data += '}';
              data = JSON.parse(data);
              }
            
            if (data.result == 'Success') {
                Raedix.gameData.winner = winner;
            }
            console.log(data);
        }, 'json');

        return Raedix;
    },
};

// HOW TO CALL ALL METHODS

// Register an Account
// Raedix
//     .initialize()                                         // Prepares the Module
//     .setRegister('test123', 'test@email.com', 'p@ssw0rd') // Sets the data to register an account
//     .sendRegister()                                       // Registers the account. Will return success if it works.



//Login.
//     .initialize()                          // Prepares the Module
//     .setLogin('test123', 'P@ss0rd', '001') // Sets the data for. Username, password, gameid
//     .sendLogin()                           // Send the login data. Sets raedix.token if it works.

//Join Matchmaking
//     .setMatchmaking('001', '02') // Sets the matchmaking data. Gameid, number of players
//     .sendMatchmaking();          // Joins the matchmaking que

//     .checkMatchmaking()        // Call this every 15 seconds. Will return Success and set .gametoken when a match is found.
//     .getGame(Raedix.gametoken) // gets the game data. Sets .gameData to the variables of the game.
//     .gameData.playerarray      // Array of player names so you know who they are playing with.
//     .gameData.numberplayers    // Tells you how many people you are playing with
//     .gameData.currentplayer    // Tells you the player number that is currently playering from the playerarray
//     .gameData.board            // The array relating to the board passed from the last player.

//     .sendMove(Raedix.gametoken, board) // Send the move to the server. Returns success unless its not your turn. Sets CurrentPlayer to the next player.
//     .endGame(Raedex.gametoken, winner) // Send the name of the person who wins.