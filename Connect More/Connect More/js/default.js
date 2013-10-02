var

AI = {
    beginTurn : function(){
        // Called when we have reached an AI turn.

        // Call this when the AI has finished its decision.
        // Example : 
        this.endTurn(0,0);
    },
    endTurn : function(x, y){
        Gates.animating = true;
        setTimeout(function(){
            setTimeout(function(){Gates.animating = false;}, 1300);

            Data.logicGrid.data[x][y] = Data.curPlayer;

            var _id        = (x+(7*y));
            var _oldPlayer = Data.curPlayer;

            Nodes.elements[_id].className = 'element bounce player'+Data.curPlayer;
            setTimeout(function(){
                Nodes.elements[_id].className = 'element shown player'+_oldPlayer;
            }, 1000);

            if (Data.onlineGame) Online.sendMove();

            if (Data.evaluateGrid(x, y)) return;

            if (Data.curPlayer === Data.numPlayers-1) Data.curPlayer = 0;
            else Data.curPlayer++;

            UI.setPlayer();
        }, 600);
    }
},

Players = [
    {
        human    : true,
        active   : true,
        remote   : false,
        lastTurn : [null, null],
        name     : "Player 1"
    },
    {
        human    : true,
        active   : true,
        remote   : false,
        lastTurn : [null, null],
        name     : "Player 2"
    },
    {
        human    : true,
        active   : false,
        remote   : false,
        lastTurn : [null, null],
        name     : "Player 3"
    },
    {
        human    : true,
        active   : false,
        remote   : false,
        lastTurn : [null, null],
        name     : "Player 4"
    }
],

Nodes = {
    raedixLogin  : document.getElementById('raedix-login'),
    title        : document.getElementById('title'),
    board        : document.getElementById('board'),
    grid         : document.getElementById('grid'),
    titleElem    : document.getElementsByClassName('tiny-element'),
    options      : document.getElementById('options'),
    optnElem     : document.getElementsByClassName('tiny-element-optn'),
    descripts    : document.getElementsByClassName('descript'),
    elements     : document.getElementsByClassName('element'),
    curPlayer    : document.getElementById('cur-player'),
    winMssg      : document.getElementById('win-mssg'),
    playO        : document.getElementById('play-online'),
    playL        : document.getElementById('play-locally'),
    begin        : document.getElementById('begin'),
    localOptions : document.getElementById('local-game-options'),
},

Gates = {
    animating  : false,
    gameActive : false,
},

Data = {

    onlineGame : false,

    numPlayers : 2,
    numHumans  : 2,
    numComp    : 0,
    numConnect : 4,
    curPlayer  : 0,
    currentRow : 0,

    logicGrid  : {
        height : 6,
        width  : 7,
    },

    drawLogicGrid : function(){
        this.logicGrid.data = [];

        for (var i = 0, _len = this.logicGrid.width; i < _len; i++){
            var _temp = [];
            for (var j = 0, _len2 = this.logicGrid.height; j < _len2; j++){
                _temp.push(-1);
            }
            this.logicGrid.data.push(_temp);
        }
    },

    evaluateGrid : function(x, y){
        var _first      = null,
            _matched    = 0,
            _gameWidth  = this.logicGrid.width,
            _gameHeight = this.logicGrid.height;

        _first = this.logicGrid.data[x][y];

        // Vertical test.
        for (var i = y; i >= 0; i--){
            if (_first === this.logicGrid.data[x][i]) _matched++;
            else                                      break;

            if (_matched >= this.numConnect) {
                UI.playerWins(_first);
                return true;
            }
        }
        _matched = 0;

        // Horizontal test moving left/right.
        for (var i = x; i > 0; i--){
            if (_first === this.logicGrid.data[i-1][y]) _matched++;
            else                                        break;
        }
        for (var i = x; i < this.logicGrid.width-1; i++){
            if (_first === this.logicGrid.data[i+1][y]) _matched++; 
            else                                        break;
        }
        if (_matched >= this.numConnect-1) {
            UI.playerWins(_first);
            return true;
        }
        _matched = 0;

        // Diagonal test moving down-left/up-right.
        for (var i = x, j = y; i > 0 && j > 0; i--, j--) {
            if      (_first === this.logicGrid.data[i-1][j-1]) _matched++;
            else                                               break;
        }
        for (var i = x, j = y; i < this.logicGrid.width-1 && j < this.logicGrid.height-1; i++, j++){
            if      (_first === this.logicGrid.data[i+1][j+1]) _matched++;
            else                                               break;
        }
        if (_matched >= this.numConnect-1) {
            UI.playerWins(_first);
            return true;
        }
        _matched = 0;

        // Diagonal test moving down-right/up-left.
        for (var i = x, j = y; i < this.logicGrid.width-1 && j > 0; i++, j--){
            if (_first === this.logicGrid.data[i+1][j-1]) _matched++;
            else                                          break;
        }
        for (var i = x, j = y; i > 0 && j < this.logicGrid.height-1; i--, j++){
            if (_first === this.logicGrid.data[i-1][j+1]) _matched++;
            else                                          break;
        }
        if (_matched >= this.numConnect-1) {
            UI.playerWins(_first);
            return true;
        }

        // No one has won.
        return false;
    },
},

Logic = function(){
    "use strict";

    var

    getOptions = function(target){
        var _numHumans    = null,
            _numComputers = null,
            _numConnect   = null,
            _tempPl       = null,
            _classes      = null;

        for (var i = 0, len = Nodes.optnElem.length; i < len; i++){
            _classes = Nodes.optnElem[i].className.split(' ');
            if (_classes.length > 2 && _classes[1] === 'selected'){
                switch (Nodes.optnElem[i].parentNode.className){
                    case 'select-players':
                        _numHumans    = Number(Nodes.optnElem[i].innerHTML);
                        break;
                    case 'select-computers':
                        _numComputers = Number(Nodes.optnElem[i].innerHTML);
                        break;
                    case 'select-num-connect':
                        _numConnect   = Number(Nodes.optnElem[i].innerHTML);
                        break;
                }
            }

            Nodes.optnElem[i].className = 'tiny-element-optn bounce2';
        }

        if (target === 'select-players'){
            if (_numHumans === 1){
                if (_numComputers < 1) _numComputers = 1;
            } else if (_numHumans === 2){
                if (_numComputers > 2) _numComputers = 2;
            } else if (_numHumans === 3){
                if (_numComputers > 1) _numComputers = 1;
            } else if (_numHumans === 4){
                if (_numComputers > 0) _numComputers = 0;
            }
        } else if (target === 'select-computers'){
            if (_numComputers === 0){
                if (_numHumans === 1) _numHumans = 2;
            } else if (_numComputers === 1){
                if (_numHumans > 3) _numHumans = 3;
            } else if (_numComputers === 2){
                if (_numHumans > 2) _numHumans = 2;
            } else if (_numComputers === 3){
                if (_numHumans > 1) _numHumans = 1;
            }
        }

        document.getElementById('pl'+_numHumans).className    = 'tiny-element-optn selected bounce2';
        document.getElementById('ai'+_numComputers).className = 'tiny-element-optn selected bounce2';
        document.getElementById('con'+_numConnect).className  = 'tiny-element-optn selected bounce2';

        Data.numPlayers = _numHumans+_numComputers;
        Data.numHumans  = _numHumans;
        Data.numConnect = _numConnect;

        return Logic;
    },

    setGameInstanceData = function(){
        // Player 1 will always be active and human.
        // Player 2 will always be active.

        Data.onlineGame = false;
        Data.curPlayer  = 0;
        Data.currentRow = 0;

        Data.drawLogicGrid();

        Players[1].human  = (Data.numHumans > 1)?  true : false;

        Players[2].human  = (Data.numHumans > 2)?  true : false;
        Players[2].active = (Data.numPlayers > 2)? true : false;

        Players[3].human  = (Data.numHumans > 3)?  true : false;
        Players[3].active = (Data.numPlayers > 3)? true : false;

        return Logic;
    };

    return {
        getOptions          : getOptions,
        setGameInstanceData : setGameInstanceData
    };
}(),

UI = function(){
    "use strict";

    var
    showWelcomeView = function(){
        setTimeout(function(){
            _massBounceAnim(Nodes.titleElem, "tiny-element shown");
            setTimeout(function(){Nodes.playO.className = "button";}, 1200);
            setTimeout(function(){Nodes.playL.className = "button";}, 1400);
        }, 600);

        return UI;
    },

    hideWelcomeView = function(){
        Nodes.playO.className = "goodbye";
        Nodes.playL.className = "goodbye";
        Nodes.title.className = 'goodbye';

        setTimeout(function(){
            Nodes.title.className = "hidden";
            for (var i = 0, len = Nodes.titleElem.length; i < len; i++){
                Nodes.titleElem[i].className = 'tiny-element';
            }
        }, 700);

        return UI;
    },

    showGmOptnsView = function(){
        _massBounceAnim(Nodes.optnElem, false);
        for (var i = 0, len = 3; i < len; i++){
            Nodes.descripts[i].className = "descript";
            _addFadeIn(Nodes.descripts[i], (i+3));
        }
        setTimeout(function(){
            Nodes.begin.className = "button";
            setTimeout(function(){Nodes.begin.className = "button faded-in";}, 10);
        }, 1800);

        return UI;
    },

    hideGmOptnsView = function(){
        Nodes.begin.className   = "faded-in goodbye";
        Nodes.options.className = "faded-out options";

        setTimeout(function(){
            Nodes.options.className = "options";

            for (var i = 0, len = Nodes.descripts.length; i < len; i++){
                Nodes.descripts[i].className = "descript hidden";
            }
            for (var i = 0, len = Nodes.optnElem.length; i < len; i++){
                if (i === 1 || i === 4 || i === 9){
                    Nodes.optnElem[i].className = "tiny-element-optn selected";
                } else {
                    Nodes.optnElem[i].className = "tiny-element-optn";
                }
            }
        }, 400);

        return UI;
    },

    showGameView = function(){
        Nodes.localOptions.className = '';
        setTimeout(function(){
            Nodes.localOptions.className = "faded-in";
        }, 10);
        setTimeout(function(){
            _glowCircle();
        }, 400);
    },

    hideGameView = function(){
        // Hide local options.
        Nodes.localOptions.className = '';
        setTimeout(function(){
            Nodes.localOptions.className = "hidden";
        }, 10);

        // Hide win message.
        Nodes.winMssg.className = "glow faded-out player"+Data.curPlayer;
        setTimeout(function(){
            Nodes.winMssg.className = "glow faded-out hidden";
        });

        Nodes.grid.className = "faded-out";
        Nodes.board.className = "";

        Nodes.title.className = "";

        showWelcomeView();
        setTimeout(function(){
            Nodes.grid.className = "";
            for (var i = Nodes.elements.length-1; i >= 0; i--){
                Nodes.elements[i].className = "element";
            }
        },400);
        
    },

    setPlayer = function(){
        Nodes.board.className = 'player'+Data.curPlayer;
        Nodes.curPlayer.innerHTML = Players[Data.curPlayer].name;

        setTimeout(function(){
            Nodes.curPlayer.className = "";
            setTimeout(function(){Nodes.curPlayer.className = "faded-in player"+Data.curPlayer;}, 10);
            setTimeout(function(){
                Nodes.curPlayer.className = "player"+Data.curPlayer;
                setTimeout(function(){Nodes.curPlayer.className = "hidden";}, 310);
            }, 1100);
        }, 500);

        return UI;
    },

    playerWins = function(winner){
        Gates.gameActive = false;

        Nodes.winMssg.className = 'glow faded-out player'+winner;
        setTimeout(function(){Nodes.winMssg.className = "glow player"+winner;}, 5);
    },

    _addLocalGameElm = function(){

    },

    _addOnlineGameElm = function(){

    },

    _massBounceAnim = function(elements, afterClass){
        for (var i = 0, len = elements.length; i < len; i++){
            _addBounce(elements[i], i);
        }

        if (afterClass !== false){
            setTimeout(function(){
                
            }, 2000);
        }

        return UI;
    },

    _addFadeIn = function(elem, i){
        setTimeout(function(){
            elem.className += " faded-in";
        }, i*300);
    },

    _addBounce = function(elem, i){
        setTimeout(function(){
            elem.className += ' bounce2';
        }, (i+1)*100);
    },

    _glowCircle = function(){
        document.getElementById('e4').className += ' glow ghost';
    };

    return {
        showWelcomeView  : showWelcomeView,
        hideWelcomeView  : hideWelcomeView,
        showGmOptnsView  : showGmOptnsView,
        hideGmOptnsView  : hideGmOptnsView,
        showGameView     : showGameView,
        hideGameView     : hideGameView,
        setPlayer        : setPlayer,
        playerWins       : playerWins
    };
}(),

Events = function(){
    "use strict";

    var
    regExNonDigit = /[^0-9]/g,
    lastId        = null,

    addEventListeners = function(){
        document.addEventListener('MSPointerUp', handlePointerUp);
        document.addEventListener('MSPointerUp', RaedixLogin.events);
        document.addEventListener('MSPointerOver', handlePointerOver);
        document.addEventListener('MSPointerOut', handlePointerOut);
    },

    handlePointerOver = function(event){
        var element  = event.target;

        if (Gates.gameActive && !Gates.animating){
            var _element = element.className.split(' ')[0];
            if (_element == 'element'){
                Data.currentRow = element.id.replace(regExNonDigit, '')%7-1;
                if (Data.currentRow < 0) Data.currentRow = 6;

                for (var i = 0, _len = Data.logicGrid.height; i < _len; i++){
                    if (Data.logicGrid.data[Data.currentRow][i] === -1){
                        var _id = (Data.currentRow+(7*i));

                        if (lastId !== null) Nodes.elements[lastId].className = 'element';
                        Nodes.elements[_id].className = 'element ghost player'+Data.curPlayer;
                        break;
                    }
                }
            }
        }
    },

    handlePointerOut = function(event){
        if (Gates.gameActive && !Gates.animating){
            for (var i = 0, _len = Data.logicGrid.height; i < _len; i++){
                if (Data.logicGrid.data[Data.currentRow][i] == -1){
                    lastId = (Data.currentRow+(7*i));
                    break;
                }
            }
        }
    },

    handlePointerUp = function(event){
        var element = event.target;

        switch (element.id) {
            case 'play-locally':
                UI
                    .hideWelcomeView()
                    .showGmOptnsView();
                return;
            case 'play-online':
                if (false){
                    Raedix.initialize();
                    UI.hideWelcomeView();
                    RaedixLogin.showView();
                }
                return;
            case 'ai0': case 'pl1': case 'con3':
            case 'ai1': case 'pl2': case 'con4':
            case 'ai2': case 'pl3': case 'con5':
            case 'ai3': case 'pl4': case 'con6':
                var _parent = element.parentNode;
                for (var i = 0; i < 4; i++){
                    _parent.children[i].className = 'tiny-element-optn bounce2';
                }
                element.className = 'tiny-element-optn selected bounce2';
                Logic.getOptions(element.parentNode.className);
                return;
            case 'begin':
                Logic.setGameInstanceData();
                UI
                    .hideGmOptnsView()
                    .setPlayer()
                    .showGameView();
                Gates.gameActive = true;
                return;
            case 'back-to-menu':
                Gates.gameActive = false;
                UI.hideGameView();
                return;
        }

        handleUserTurn();

        // Check for AI players.
        if (!Players[Data.curPlayer].human){

            AI.beginTurn();
        }

        if (Data.onlineGame){
            if (Players[Data.curPlayer].remote){

            }
        }
        
    },

    handleUserTurn = function(){
        if (Gates.gameActive && !Gates.animating) {
            for (var i = 0, _len = Data.logicGrid.height; i < _len; i++){
                if (Data.logicGrid.data[Data.currentRow][i] == -1){

                    Gates.animating = true;
                    setTimeout(function(){Gates.animating = false;}, 1300);

                    Data.logicGrid.data[Data.currentRow][i] = Data.curPlayer;

                    var _id        = (Data.currentRow+(7*i));
                    var _oldPlayer = Data.curPlayer;

                    console.log(Data.currentRow, i);

                    Nodes.elements[_id].className = 'element bounce player'+Data.curPlayer;
                    setTimeout(function(){
                        Nodes.elements[_id].className = 'element shown player'+_oldPlayer;
                    }, 1000);

                    if (Data.onlineGame) Online.sendMove();

                    if (Data.evaluateGrid(Data.currentRow, i)) return;

                    if (Data.curPlayer === Data.numPlayers-1) Data.curPlayer = 0;
                    else Data.curPlayer++;

                    UI.setPlayer();

                    break;
                }
            }
        }
    };

    return {
        addEventListeners : addEventListeners
    };
}();

// Silly Microsoft Stuff.
(function(){
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

                Events.addEventListeners();
                UI.showWelcomeView();

            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.onsettings = function (args) {
        args.detail.applicationcommands = {
            "priv": {
                title: "Privacy Policy", href: "/privacy.html"
            }
        };
        WinJS.UI.SettingsFlyout.populateSettings(args);
    };

    app.start();
})();
