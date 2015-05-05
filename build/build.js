(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _subscribe = require('util/mediator');

var _Splashscreen = require('splashscreen/model');

var _Splashscreen2 = _interopRequireDefault(_Splashscreen);

var _Menu = require('menu/model');

var _Menu2 = _interopRequireDefault(_Menu);

var _GameController = require('game-controller/model');

var _GameController2 = _interopRequireDefault(_GameController);

var ls = window.localStorage;

var globalState = document.body.classList;

var gameSettings = undefined;

React.initializeTouchEvents(true);

init();

_subscribe.subscribe('Game::restart', onStartGame);

_subscribe.subscribe('Game::end', function () {
  document.body.classList.remove('winner');
  document.body.classList.remove('in-game');
  document.querySelector('#menu').classList.add('intro');

  React.unmountComponentAtNode(document.querySelector('#splashscreen-container'));

  init();
});

window.addEventListener('touchmove', function (e) {
  return e.preventDefault();
});

onSettingsChange({
  numConnect: (ls.getItem('connectMore_numConnect') || 4) - 0,
  numHumans: (ls.getItem('connectMore_numHumans') || 1) - 0,
  numComputers: (ls.getItem('connectMore_numComputers') || 1) - 0,
  numPlayers: (ls.getItem('connectMore_numPlayers') || 2) - 0
});

function onSettingsChange() {
  var config = arguments[0] === undefined ? {} : arguments[0];

  gameSettings = {
    grid: {
      columns: 7,
      rows: 6,
      nConnect: config.numConnect
    },
    players: (function () {

      function Player(i, type) {
        var difficulty = arguments[2] === undefined ? '' : arguments[2];

        this.index = i;
        this.type = type;
        this.difficulty = difficulty;
      }

      var humans = config.numHumans;
      var computers = config.numComputers;
      var players = [];

      for (var i = 0; i < humans; i++) {
        players.push(new Player(players.length, 'human'));
      }

      for (var i = 0; i < computers; i++) {
        players.push(new Player(players.length, 'computer', 'impossible'));
      }

      return players;
    })()
  };
}

function onStartGame() {
  window.setTimeout(function () {
    _GameController2['default'].newGame(gameSettings);
    globalState.remove('winner');
    globalState.add('in-game');
  }, 100);
}

function init() {
  React.render(React.createElement(_Splashscreen2['default'], { state: 'visible' }), document.querySelector('#splashscreen-container'));

  React.render(React.createElement(_Menu2['default'], {
    onStartGame: onStartGame,
    onSettingsChange: onSettingsChange }), document.querySelector('#menu-container'));
}

},{"game-controller/model":2,"menu/model":9,"splashscreen/model":12,"util/mediator":15}],2:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _clamp = require('util/core');

var _Player = require('player/model');

var _Player2 = _interopRequireDefault(_Player);

var _Grid = require('grid/model');

var _Grid2 = _interopRequireDefault(_Grid);

var _Gameboard = require('gameboard/model');

var _Gameboard2 = _interopRequireDefault(_Gameboard);

var globalState = document.body.classList;

var gameboardContainer = document.querySelector('#gameboard-container');

var grid = undefined;
var tileSize = undefined;

var canMove = false;
var hasEnded = false;
var winningPlayer = false;

var players = undefined;
var player = undefined;

window.addEventListener('resize', setTileSize);

function setTileSize() {
  tileSize = _clamp.clamp(window.innerWidth / (grid && grid.columns || 7), 0, 100);

  update();
}

function newGame(config) {
  grid = new _Grid2['default'](config.grid);

  canMove = true;
  hasEnded = false;
  winningPlayer = false;

  players = config.players.map(function (config) {
    return new _Player2['default'](config);
  });
  player = players[0];

  setTileSize();
}

function onWin() {
  globalState.add('winner');
  hasEnded = true;
}

function onPlayerMove(column) {
  if (!canMove || hasEnded) {
    return;
  }

  winningPlayer = player.beginMove().makeMove(grid, column).endMove(grid);

  update();

  if (winningPlayer) {
    return this.onWin();
  }

  nextPlayer();
  update();

  if (player.type == 'computer') {
    canMove = false;
    window.setTimeout(onComputerMove, 1000);
  }
}

function onComputerMove() {
  winningPlayer = player.beginMove().decideMove(grid, players).endMove(grid);

  update();

  if (winningPlayer) {
    return onWin();
  }

  nextPlayer();
  update();

  if (player.type == 'computer') {
    window.setTimeout(onComputerMove, 1000);
  } else {
    canMove = true;
  }
}

function nextPlayer() {
  player = player.index === players.length - 1 ? players[0] : players[player.index + 1];
  return player;
}

function update() {
  React.render(React.createElement(_Gameboard2['default'], {
    currentPlayer: player,
    winningPlayer: winningPlayer,
    onPlayerMove: onPlayerMove,
    grid: grid,
    tileSize: tileSize }), gameboardContainer);
}

exports['default'] = {
  newGame: newGame
};
module.exports = exports['default'];

},{"gameboard/model":5,"grid/model":8,"player/model":11,"util/core":13}],3:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _hasTouch = require('util/device');

var _GameboardTile = require('gameboard/column/tile/model');

var _GameboardTile2 = _interopRequireDefault(_GameboardTile);

exports['default'] = React.createClass({
  displayName: 'GameboardColumn',

  getInitialState: function getInitialState() {
    return {
      hovered: this.props.hovered || -1
    };
  },

  onMouseUp: function onMouseUp(e) {
    if (this.props.data.indexOf(-1) === -1) {
      return;
    }

    this.props.onPlayerMove(parseInt(e.currentTarget.id, 10));
  },

  render: function render() {
    var _this = this;

    var tiles = this.props.data.map(function (tile, i) {
      return React.createElement(_GameboardTile2['default'], {
        key: i,
        className: _this.state.hovered === i ? 'hovered' : '',
        tileSize: _this.props.tileSize,
        playerClass: 'p-' + tile });
    });

    var style = {
      height: '' + this.props.height + 'px',
      width: '' + this.props.tileSize + 'px'
    };

    return React.createElement(
      'div',
      {
        onMouseUp: _hasTouch.hasTouch ? undefined : this.onMouseUp,
        id: this.props.id,
        style: style,
        className: 'gameboard-column ' + (this.props.hovered ? 'hovered' : '') },
      tiles
    );
  }
});
module.exports = exports['default'];

},{"gameboard/column/tile/model":4,"util/device":14}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = React.createClass({
  displayName: 'GameboardTile',

  render: function render() {
    var tileStyle = {
      width: '' + this.props.tileSize + 'px',
      height: '' + this.props.tileSize + 'px'
    };

    var innerStyle = {
      width: '' + (this.props.tileSize - 14) + 'px',
      height: '' + (this.props.tileSize - 14) + 'px'
    };

    return React.createElement(
      'div',
      {
        style: tileStyle,
        className: '' + this.props.playerClass + ' gameboard-tile' },
      React.createElement('div', {
        style: innerStyle,
        className: '' + this.props.className + ' shadow' }),
      React.createElement('div', {
        style: innerStyle,
        className: 'piece ' + this.props.playerClass })
    );
  }
});
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _WinnerMessage = require('gameboard/win-modal/model');

var _WinnerMessage2 = _interopRequireDefault(_WinnerMessage);

var _GameboardSurface = require('gameboard/surface/model');

var _GameboardSurface2 = _interopRequireDefault(_GameboardSurface);

var _GameboardColumn = require('gameboard/column/model');

var _GameboardColumn2 = _interopRequireDefault(_GameboardColumn);

exports['default'] = React.createClass({
  displayName: 'Gameboard',
  column: 0,

  getInitialState: function getInitialState() {
    return {
      hovered: -1 };
  },

  onTouchMove: function onTouchMove(e) {
    this.column = Math.floor(e.changedTouches[0].pageX / this.props.tileSize);
    if (this.column !== this.state.hovered) {
      this.setState({ hovered: this.column });
    }
  },

  onTouchEnd: function onTouchEnd(e) {
    this.column = Math.floor(e.changedTouches[0].pageX / this.props.tileSize);
    this.setState({ hovered: -1 });
    this.props.onPlayerMove(this.column);
  },

  render: function render() {
    var _this = this;

    var width = this.props.grid.columns * this.props.tileSize;
    var height = this.props.grid.rows * this.props.tileSize;
    var style = {
      width: '' + width + 'px',
      height: '' + height + 'px',
      margin: '60px -' + width / 2 + 'px'
    };

    var columns = this.props.grid.data.map(function (column, i) {
      return React.createElement(_GameboardColumn2['default'], {
        onPlayerMove: _this.props.onPlayerMove,
        key: i,
        id: i,
        data: column,
        height: height,
        hovered: _this.state.hovered == i,
        tileSize: _this.props.tileSize });
    });

    return React.createElement(
      'section',
      {
        onTouchMove: this.onTouchMove,
        onTouchEnd: this.onTouchEnd,

        style: style,
        id: 'gameboard' },
      React.createElement(
        'div',
        {
          id: 'current-player',
          className: 'player-' + (this.props.currentPlayer ? this.props.currentPlayer.index + 1 : 0) },
        React.createElement(
          'div',
          null,
          'Player 1'
        ),
        React.createElement(
          'div',
          null,
          'Player 2'
        ),
        React.createElement(
          'div',
          null,
          'Player 3'
        ),
        React.createElement(
          'div',
          null,
          'Player 4'
        )
      ),
      columns,
      React.createElement(_GameboardSurface2['default'], {
        nConnect: this.props.grid.nConnect,
        width: this.props.grid.columns,
        tileSize: this.props.tileSize }),
      React.createElement(_WinnerMessage2['default'], {
        winningPlayer: this.props.winningPlayer })
    );
  }
});
module.exports = exports['default'];

},{"gameboard/column/model":3,"gameboard/surface/model":6,"gameboard/win-modal/model":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _hasTouch = require('util/device');

var _publish = require('util/mediator');

exports['default'] = React.createClass({
  displayName: 'GameboardSurface',

  goToMenu: function goToMenu() {
    _publish.publish('Game::end');
  },

  render: function render() {
    var style = {
      width: '' + this.props.width * this.props.tileSize + 'px'
    };

    return React.createElement(
      'div',
      {
        id: 'gameboard-surface',
        className: this.props.state,
        style: style },
      React.createElement(
        'div',
        {
          onTouchEnd: this.goToMenu,
          onClick: _hasTouch.hasTouch ? null : this.goToMenu,
          id: 'btn-menu' },
        'End Game'
      ),
      React.createElement(
        'div',
        { id: 'n-connect' },
        this.props.nConnect,
        ' to connect.'
      )
    );
  }
});
module.exports = exports['default'];

},{"util/device":14,"util/mediator":15}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _hasTouch = require('util/device');

var _publish = require('util/mediator');

exports['default'] = React.createClass({
  displayName: 'WinnerMessage',

  playAgain: function playAgain() {
    _publish.publish('Game::restart');
    this.setState({ className: '', player: '' });
  },

  goToMenu: function goToMenu() {
    _publish.publish('Game::end');
    this.setState({
      className: '',
      player: ''
    });
  },

  render: function render() {
    if (!this.props.winningPlayer) {
      return React.createElement('div', null);
    };

    var className = this.props.winningPlayer ? 'active' : '';
    var player = this.props.winningPlayer || {};

    return React.createElement(
      'div',
      { id: 'winner-message', className: className },
      React.createElement(
        'div',
        { id: 'message' },
        'The title of ',
        React.createElement(
          'span',
          { className: 'champion' },
          '“Champion”'
        ),
        'is hereby awarded to the respected ',
        player.type,
        ',',
        React.createElement(
          'span',
          { className: 'name' },
          player.name
        )
      ),
      React.createElement(
        'div',
        {
          onTouchEnd: this.playAgain,
          onClick: _hasTouch.hasTouch ? undefined : this.playAgain,
          id: 'btn-play-again' },
        'Play again'
      ),
      React.createElement(
        'div',
        {
          onTouchEnd: this.goToMenu,
          onClick: _hasTouch.hasTouch ? undefined : this.goToMenu,
          id: 'btn-menu' },
        'Return to menu'
      )
    );
  }
});
module.exports = exports['default'];

},{"util/device":14,"util/mediator":15}],8:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Grid = (function () {
  function Grid() {
    var config = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Grid);

    this.columns = config.columns || 7;
    this.rows = config.rows || 6;
    this.nConnect = config.nConnect || 4;

    this._data = [];

    for (var x = 0, c = this.columns; x < c; x++) {
      this._data.push([]);

      for (var y = 0, r = this.rows; y < r; y++) {
        this._data[x].push(-1);
      }
    }
  }

  _createClass(Grid, [{
    key: "data",
    get: function () {
      return this._data;
    }
  }, {
    key: "insertPiece",
    value: function insertPiece(column, player) {
      var r = this.rows;

      while (r-- > 0) {
        if (this._data[column][r] === -1) {
          this._data[column][r] = player;
          break;
        }
      }
      return { x: column, y: r };
    }
  }, {
    key: "removePiece",
    value: function removePiece(column, row) {}
  }, {
    key: "pieceIsInsertable",
    value: function pieceIsInsertable(column, row) {
      return this._data[column] && this._data[column][row] && this._data[column][row] === -1 && this._data[column][row + 1] !== -1;
    }
  }, {
    key: "isFilled",
    value: function isFilled() {
      for (var i = 0, column = undefined; column = this._data[i]; i++) {
        for (var j = 0, tile = undefined; tile = column[j]; j++) {
          if (tile === -1) {
            return false;
          }
        }
      }

      return true;
    }
  }, {
    key: "canContinueChainInDirection",
    value: function canContinueChainInDirection(column, row) {
      var dir = arguments[2] === undefined ? { x: 0, y: 0 } : arguments[2];

      var grid = this._data;

      return this.pieceIsInsertable(column + dir.x, row + dir.y);
    }
  }, {
    key: "canCompleteChain",
    value: function canCompleteChain(column, row, dir, needed) {
      var grid = this._data;

      for (var i = needed; i > 0; i--) {
        column = column + dir.x;
        row = row + dir.y;

        if (!this.pieceIsInsertable(column, row)) {
          break;
        }

        needed = needed - 1;
      }

      return needed === 0;
    }
  }, {
    key: "findChainContinuingColumn",
    value: function findChainContinuingColumn(chain) {
      var first = chain[0];
      var m2 = chain[1];
      var m3 = chain[chain.length - 2];
      var last = chain[chain.length - 1];

      var dx1 = first.x - m2.x;
      var dy1 = first.y - m2.y;

      var dx2 = last.x - m3.x;
      var dy2 = last.y - m3.y;

      if (this.pieceIsInsertable(first.x + dx1, first.y + dy1)) {
        return { x: first.x + dx1, y: first.y, dir: { x: dx1, y: dy1 } };
      }

      if (this.pieceIsInsertable(last.x + dx2, last.y + dy2)) {
        return { x: last.x + dx2, y: first.y, dir: { x: dx2, y: dy2 } };
      }

      return { x: -1, y: -1 };
    }
  }, {
    key: "makeChainFromPoint",

    // This method optimizes by only starting
    // at the last x, y coordinate and checking only
    // what's necessary
    value: function makeChainFromPoint(x, y, p) {
      var c = arguments[3] === undefined ? this.nConnect : arguments[3];

      var w = this.columns;
      var h = this.rows;
      var grid = this._data;

      // We set matched to 1 since we already know the status of
      // our current coordinates
      var m = [{ x: x, y: y }];

      // Vertical test going down
      for (var i = y + 1; i < h; i++) {
        if (grid[x][i] == p) m.push({ x: x, y: i });else break;
      }

      if (m.length >= c) {
        return m;
      } else m = [{ x: x, y: y }];

      // Horizontal test moving left and right.
      for (var i = x - 1; i > -1; i--) {
        if (grid[i] && grid[i][y] == p) m.unshift({ x: i, y: y });else break;
      }
      for (var i = x + 1; i < w; i++) {
        if (grid[i] && grid[i][y] == p) m.push({ x: i, y: y });else break;
      }

      if (m.length >= c) {
        return m;
      } else m = [{ x: x, y: y }];

      // Diagonal test moving up-left and down-right
      for (var i = x - 1, j = y - 1; i > -1 && j > -1; i--, j--) {
        if (grid[i] && grid[i][j] == p) m.unshift({ x: i, y: j });else break;
      }
      for (var i = x + 1, j = y + 1; i < w && j < h; i++, j++) {
        if (grid[i] && grid[i][j] == p) m.push({ x: i, y: j });else break;
      }

      if (m.length >= c) {
        return m;
      } else m = [{ x: x, y: y }];

      // Diagonal test moving down-right and up-left
      for (var i = x + 1, j = y - 1; i < w && j > -1; i++, j--) {
        if (grid[i] && grid[i][j] == p) m.unshift({ x: i, y: j });else break;
      }
      for (var i = x - 1, j = y + 1; i > -1 && j < h; i--, j++) {
        if (grid[i] && grid[i][j] == p) m.push({ x: i, y: j });else break;
      }

      if (m.length >= c) {
        return m;
      } else m = [{ x: x, y: y }];

      return m;
    }
  }]);

  return Grid;
})();

exports["default"] = Grid;
;
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _hasTouch = require('util/device');

var _Settings = require('menu/settings/model');

var _Settings2 = _interopRequireDefault(_Settings);

exports['default'] = React.createClass({
  displayName: 'Menu',
  toSkipIntro: false,

  getInitialState: function getInitialState() {
    return {
      menuState: 'intro',
      introState: ''
    };
  },

  componentDidMount: function componentDidMount() {
    setTimeout(function () {
      return document.getElementById('title').classList.add('active');
    }, 100);
  },

  play: function play(e) {
    this.props.onStartGame();
  },

  settings: function settings(e) {
    this.setState({
      menuState: this.state.menuState === 'settings' ? '' : 'settings'
    });
  },

  skipIntro: function skipIntro() {
    if (this.toSkipIntro) {
      return;
    }

    this.setState({ introState: 'skip-intro' });
    this.toSkipIntro = true;
  },

  render: function render() {
    return React.createElement(
      'div',
      {
        className: '' + this.state.menuState + ' ' + this.state.introState,
        onTouchEnd: this.skipIntro,
        id: 'menu' },
      React.createElement(
        'div',
        { id: 'title' },
        'Connect More',
        React.createElement(
          'div',
          {
            onTouchEnd: this.play,
            onClick: _hasTouch.hasTouch ? undefined : this.play,
            id: 'btn-play' },
          'I accept'
        ),
        React.createElement(
          'div',
          {
            onTouchEnd: this.settings,
            onClick: _hasTouch.hasTouch ? undefined : this.settings,
            id: 'btn-settings' },
          'Arrangements'
        )
      ),
      React.createElement(_Settings2['default'], {
        onSubmit: this.settings,
        onSettingsChange: this.props.onSettingsChange })
    );
  }
});
module.exports = exports['default'];

},{"menu/settings/model":10,"util/device":14}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _hasTouch = require('util/device');

exports['default'] = React.createClass({
  displayName: 'Settings',

  getInitialState: function getInitialState() {
    var ls = window.localStorage;
    var nC = ls.getItem('connectMore_numConnect') || 4;
    var nH = ls.getItem('connectMore_numHumans') || 1;
    var nAI = ls.getItem('connectMore_numComputers') || 1;
    var nP = ls.getItem('connectMore_numPlayers') || 2;
    var ss = ls.getItem('connectMore_soundState') || 1;

    return {
      numConnect: nC - 0,
      numHumans: nH - 0,
      numComputers: nAI - 0,
      numPlayers: nP - 0,
      sound: Boolean(ss - 0) };
  },

  componentDidUpdate: function componentDidUpdate() {
    var ls = window.localStorage;
    ls.setItem('connectMore_numConnect', this.state.numConnect);
    ls.setItem('connectMore_numHumans', this.state.numHumans);
    ls.setItem('connectMore_numComputers', this.state.numComputers);
    ls.setItem('connectMore_numPlayers', this.state.numPlayers);

    // Bool to number to string, oh my!
    ls.setItem('connectMore_soundState', '' + (this.state.sound - 0));
  },

  changeConnect: function changeConnect(e) {
    this.setState({
      numConnect: e.target.textContent - 0
    });
  },

  changePlayerNum: function changePlayerNum(e) {
    var num = e.target.textContent - 0;
    var comps = this.state.numComputers;
    var humans = this.state.numHumans;

    switch (e.target.classList[1]) {
      case 'num-human-players':
        this.setState({
          numHumans: num,
          numComputers: comps + num > 4 ? 4 - num : num < 2 && comps < 1 ? 1 : comps
        });
        break;
      case 'num-computer-players':
        this.setState({
          numHumans: humans + num > 4 ? 4 - num : humans,
          numComputers: num
        });
        break;
      default:
        break;
    }
  },

  toggleSound: function toggleSound() {
    var newState = !this.state.sound;
    this.setState({ sound: newState });
  },

  onSubmit: function onSubmit() {
    this.props.onSettingsChange(this.state);
    this.props.onSubmit();
  },

  render: function render() {
    return React.createElement(
      'div',
      { id: 'settings' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { id: 'num-connect', className: 'container', 'data-num': this.state.numConnect },
          React.createElement(
            'span',
            { onTouchEnd: this.changeConnect, onClick: _hasTouch.hasTouch ? null : this.changeConnect, className: 'option num-connect' },
            '3'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changeConnect, onClick: _hasTouch.hasTouch ? null : this.changeConnect, className: 'option num-connect' },
            '4'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changeConnect, onClick: _hasTouch.hasTouch ? null : this.changeConnect, className: 'option num-connect' },
            '5'
          ),
          React.createElement(
            'span',
            { className: 'title' },
            'to Connect'
          )
        ),
        React.createElement(
          'div',
          { id: 'num-human-players', className: 'container', 'data-num': this.state.numHumans },
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-human-players' },
            '1'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-human-players' },
            '2'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-human-players' },
            '3'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-human-players' },
            '4'
          ),
          React.createElement(
            'span',
            { className: 'title' },
            'Human Players'
          )
        ),
        React.createElement(
          'div',
          { id: 'num-computer-players', className: 'container', 'data-num': this.state.numComputers },
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-computer-players' },
            '0'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-computer-players' },
            '1'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-computer-players' },
            '2'
          ),
          React.createElement(
            'span',
            { onTouchEnd: this.changePlayerNum, onClick: _hasTouch.hasTouch ? null : this.changePlayerNum, className: 'option num-computer-players' },
            '3'
          ),
          React.createElement(
            'span',
            { className: 'title' },
            'Computer Players'
          )
        )
      ),
      React.createElement(
        'div',
        { id: 'btn-ammend', onTouchEnd: this.onSubmit, onClick: _hasTouch.hasTouch ? null : this.onSubmit },
        'Ammend registry'
      ),
      React.createElement(
        'div',
        { hidden: 'true', id: 'btn-sound-state', className: this.state.sound ? 'on' : 'off' },
        React.createElement(
          'div',
          { onTouchEnd: this.toggleSound, onClick: _hasTouch.hasTouch ? null : this.toggleSound, className: 'sound-option' },
          'Sound on'
        ),
        React.createElement(
          'div',
          { onTouchEnd: this.toggleSound, onClick: _hasTouch.hasTouch ? null : this.toggleSound, className: 'sound-option' },
          'Sound off'
        )
      )
    );
  }
});
module.exports = exports['default'];

},{"util/device":14}],11:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _randomFloat$randomInt = require('util/core');

var Player = (function () {
  function Player(config) {
    _classCallCheck(this, Player);

    this.index = config.index;
    this.name = config.name || 'Player ' + (this.index + 1);
    this.type = config.type || 'computer';
    this.moves = [];
    this.longestChains = [];
    this.noteIndex = 0;

    if (this.type !== 'computer') {
      return;
    }

    this.difficulty = config.difficulty;
    this.errorFactor = 0.1 * _randomFloat$randomInt.randomFloat(this.difficulty == 'easy' ? 6.66 : this.difficulty == 'medium' ? 3.33 : 0, this.difficulty == 'easy' ? 10 : this.difficulty == 'medium' ? 6.66 : 3.33);
    this.errorFactor = this.difficulty === 'impossible' ? 0 : this.errorFactor;
  }

  _createClass(Player, [{
    key: 'beginMove',
    value: function beginMove() {
      return this;
    }
  }, {
    key: 'makeMove',
    value: function makeMove(grid, column) {
      this.moves.push(grid.insertPiece(column, this.index));
      return this;
    }
  }, {
    key: 'endMove',
    value: function endMove(grid) {
      this.longestChains = this.findLongestChain(grid, grid.nConnect);

      if (this.longestChains.filter(function (chain) {
        return chain.length === grid.nConnect;
      })[0]) {
        return this;
      }
      return false;
    }
  }, {
    key: 'findLongestChain',
    value: function findLongestChain(grid, max) {
      var longestChains = [];
      // We'll move from chains staring at length of two up to the max number
      for (var i = 2; i < max; i++) {
        // Now we'll go though all the player's moves
        for (var j = 0, move = undefined; move = this.moves[j]; j++) {
          var chain = grid.makeChainFromPoint(move.x, move.y, this.index, i);
          var spliced = undefined;

          if (!longestChains.length) {
            longestChains.push(chain);
          }

          for (var k = 0; k < longestChains.length; k++) {
            if (chain.length > longestChains[k].length) {
              spliced = longestChains.splice(k, 1);
            }
          }

          if (spliced) {
            longestChains.push(chain);
          }
        }
      }
      return longestChains;
    }
  }, {
    key: 'decideMove',

    // The Algorithm that the AI follows is pretty simple.
    // If a step fails it proceeds to the following step.
    //
    // (1) It tests its error factor (derived from its difficulty level)
    //     against a random number and if is within a specified range it
    //     malfunctions and drops a piece randomly.
    //
    // (2) It searches for any player, including itself, that is
    //     one play away from winning. It then either blocks the
    //     other player from winning or attempts to win.
    //
    // (3) It searches for a chain of pieces that it has previously made
    //     and adds to it if it is possible and can eventually lead to a
    //     win scenario.
    //
    // (4) It starts a chain by finding a previously laid piece.
    //
    // (5) It searches for a chain another player is making and blocks it.
    //
    // (6) It places a piece randomly.
    //
    value: function decideMove(grid, players) {
      // (1)
      // if (Math.random() < this.errorFactor) {
      //   return this.makeMove(grid, randomInt(0, grid.columns-1));
      // }

      // (2)
      for (var i = 0, player = undefined; player = players[i]; i++) {
        if (player.index === this.index) break;
        for (var j = 0, chain = undefined; chain = player.longestChains[j]; j++) {
          if (chain.length === grid.nConnect - 1) {
            var data = grid.findChainContinuingColumn(chain);
            if (data.x > -1) {
              return this.makeMove(grid, data.x);
            }
          }
        }
      }

      // (2) Pt. 2
      for (var j = 0, chain = undefined; chain = this.longestChains[j]; j++) {
        if (chain.length === grid.nConnect - 1) {
          var data = grid.findChainContinuingColumn(chain);
          if (data.x > -1) {
            return this.makeMove(grid, data.x);
          }
        }
      }

      // (3) TODO incomplete
      for (var i = 0, chain = undefined; chain = this.longestChains[i]; i++) {
        if (chain.length > 1) {
          var data = grid.findChainContinuingColumn(chain);
          if (data.x > -1) {
            return this.makeMove(grid, data.x);
          }
        }
      }

      // (4)
      for (var i = 0, move = undefined; move = this.moves[i]; i++) {
        for (var _i = 0; _i < 5; _i++) {
          var x = _i < 2 ? -1 : _i < 3 ? 0 : 1;
          var y = _i < 1 ? 0 : _i < 4 ? 1 : 0;
          var canComplete = grid.canCompleteChain(move.x, move.y, { x: x, y: y }, grid.nConnect - 1);
          if (canComplete) {
            return this.makeMove(grid, move.x + x);
          }
        }
      }

      // (5)
      for (var i = 0, player = undefined; player = players[i]; i++) {
        for (var j = 0, chain = undefined; chain = player.longestChains[j]; j++) {
          if (chain.length > 1) {
            var data = grid.findChainContinuingColumn(chain);
            if (data.x > -1) {
              return this.makeMove(grid, data.x);
            }
          }
        }
      }

      // (6)
      return this.makeMove(grid, _randomFloat$randomInt.randomInt(0, grid.columns - 1));
    }
  }]);

  return Player;
})();

exports['default'] = Player;
module.exports = exports['default'];

},{"util/core":13}],12:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Gameboard = require('gameboard/model');

var _Gameboard2 = _interopRequireDefault(_Gameboard);

var _Grid = require('grid/model');

var _Grid2 = _interopRequireDefault(_Grid);

var _Player = require('player/model');

var _Player2 = _interopRequireDefault(_Player);

var globalState = document.body.classList;

exports['default'] = React.createClass({
  displayName: 'Splashscreen',
  resizeId: null,
  addPieceId: null,
  players: [],
  player: null,

  getInitialState: function getInitialState() {
    var grid = new _Grid2['default']({ rows: 16, nConnect: 99 });
    return {
      grid: grid,
      tileSize: window.innerWidth / grid.columns
    };
  },

  componentDidMount: function componentDidMount() {
    window.addEventListener('resize', this.resize);

    this.initFauxGame();
    this.addPieceId = window.setTimeout(this.addRandomPiece, 500);
  },

  resize: function resize() {
    if (globalState.contains('in-game')) {
      return;
    }

    var tileSize = Math.floor(window.innerWidth / this.state.grid.columns);

    this.setState({ tileSize: tileSize });
  },

  initFauxGame: function initFauxGame() {
    this.players = [0, 1, 2, 3].map(function (i) {
      return new _Player2['default']({ index: i });
    });
    this.player = this.players[0];
  },

  addRandomPiece: function addRandomPiece() {
    this.player.beginMove().decideMove(this.state.grid, this.players).endMove(this.state.grid);
    this.setState({ grid: this.state.grid });
    this.nextPlayer();

    if (this.state.grid.isFilled() || document.body.classList.contains('in-game')) {
      return;
    }this.addPieceId = window.setTimeout(this.addRandomPiece, 150);
  },

  nextPlayer: function nextPlayer() {
    this.player = this.player.index === this.players.length - 1 ? this.players[0] : this.players[this.player.index + 1];
    return this.player;
  },

  render: function render() {
    return React.createElement(
      'div',
      { id: 'splashscreen', className: this.props.state },
      React.createElement(_Gameboard2['default'], { grid: this.state.grid, tileSize: this.state.tileSize })
    );
  }
});
module.exports = exports['default'];

},{"gameboard/model":5,"grid/model":8,"player/model":11}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomInt = randomInt;
exports.randomFloat = randomFloat;
exports.clamp = clamp;

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(x, min, max) {
  return x < min ? min : x > max ? max : x;
}

exports["default"] = {
  randomInt: randomInt,
  randomFloat: randomFloat,
  clamp: clamp
};

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var hasTouch = window.ontouchstart !== undefined;
exports.hasTouch = hasTouch;
var ptrEnabled = navigator.pointerEnabled || navigator.msPointerEnabled;

exports.ptrEnabled = ptrEnabled;
var ptrdown = ptrEnabled ? 'pointerdown' : hasTouch ? 'touchstart' : 'mousedown';
exports.ptrdown = ptrdown;
var ptrmove = ptrEnabled ? 'pointermove' : hasTouch ? 'touchmove' : 'mousemove';
exports.ptrmove = ptrmove;
var ptrup = ptrEnabled ? 'pointerup' : hasTouch ? 'touchend' : 'mouseup';

exports.ptrup = ptrup;
if (!hasTouch) document.body.classList.add('desktop');

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.publish = publish;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
var channels = new Map();
var idProvider = 0;

function publish(name, data) {
  var channel = channels.get(name);

  if (!channel) {
    return;
  }for (var i = 0, il = channel.length; i < il; i++) {
    channel[i](data);
  }
}

function subscribe(name, func) {
  func.id = ++idProvider;
  if (!channels.has(name)) channels.set(name, []);
  channels.get(name).push(func);
  return idProvider;
}

function unsubscribe(name, id) {
  var channel = channels.get(name);
  var result = false;

  if (!channel) throw new Error('No channel to unsubscribe from.');

  for (var i = 0, il = channel.length; i < il; i++) {
    if (channel[i].id === id) {
      channel.splice(i, 1);
      result = true;
      break;
    }
  }

  if (!result) throw new Error('No listener was unsubscribed.');
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWljaGVhbHBhcmtzL0RvY3VtZW50cy9naXRodWIvY29ubmVjdC1tb3JlL2FwcC9hcHAuanMiLCIvVXNlcnMvbWljaGVhbHBhcmtzL0RvY3VtZW50cy9naXRodWIvY29ubmVjdC1tb3JlL2FwcC9nYW1lLWNvbnRyb2xsZXIvbW9kZWwuanMiLCIvVXNlcnMvbWljaGVhbHBhcmtzL0RvY3VtZW50cy9naXRodWIvY29ubmVjdC1tb3JlL2FwcC9nYW1lYm9hcmQvY29sdW1uL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvZ2FtZWJvYXJkL2NvbHVtbi90aWxlL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvZ2FtZWJvYXJkL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvZ2FtZWJvYXJkL3N1cmZhY2UvbW9kZWwuanMiLCIvVXNlcnMvbWljaGVhbHBhcmtzL0RvY3VtZW50cy9naXRodWIvY29ubmVjdC1tb3JlL2FwcC9nYW1lYm9hcmQvd2luLW1vZGFsL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvZ3JpZC9tb2RlbC5qcyIsIi9Vc2Vycy9taWNoZWFscGFya3MvRG9jdW1lbnRzL2dpdGh1Yi9jb25uZWN0LW1vcmUvYXBwL21lbnUvbW9kZWwuanMiLCIvVXNlcnMvbWljaGVhbHBhcmtzL0RvY3VtZW50cy9naXRodWIvY29ubmVjdC1tb3JlL2FwcC9tZW51L3NldHRpbmdzL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvcGxheWVyL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvc3BsYXNoc2NyZWVuL21vZGVsLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvdXRpbC9jb3JlLmpzIiwiL1VzZXJzL21pY2hlYWxwYXJrcy9Eb2N1bWVudHMvZ2l0aHViL2Nvbm5lY3QtbW9yZS9hcHAvdXRpbC9kZXZpY2UuanMiLCIvVXNlcnMvbWljaGVhbHBhcmtzL0RvY3VtZW50cy9naXRodWIvY29ubmVjdC1tb3JlL2FwcC91dGlsL21lZGlhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozt5QkNBMkIsZUFBZTs7NEJBRWYsb0JBQW9COzs7O29CQUNwQixZQUFZOzs7OzhCQUNaLHVCQUF1Qjs7OztBQUVsRCxJQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDOztBQUUvQixJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzs7QUFFMUMsSUFBSSxZQUFZLFlBQUEsQ0FBQzs7QUFFakIsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFBOztBQUVqQyxJQUFJLEVBQUUsQ0FBQzs7QUFFUCxXQWhCUSxTQUFTLENBZ0JOLGVBQWUsRUFBRSxXQUFXLENBQUUsQ0FBQzs7QUFFMUMsV0FsQlEsU0FBUyxDQWtCTixXQUFXLEVBQUUsWUFBTTtBQUM1QixVQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsVUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLFVBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdkQsT0FB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LFNBQU8sVUFBVSxDQUFDO0NBQ25COztBQUVNLFNBQVMsV0FBVyxDQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDckMsTUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxNQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7O0FBRW5CLE1BQUksQ0FBRSxPQUFPLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDOztBQUVsRSxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hELFFBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDeEIsYUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckIsWUFBTSxHQUFHLElBQUksQ0FBQztBQUNkLFlBQU07S0FDUDtHQUNGOztBQUVELE1BQUksQ0FBRSxNQUFNLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0NBQy9EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7c3Vic2NyaWJlfSAgICBmcm9tICd1dGlsL21lZGlhdG9yJztcbiBcbmltcG9ydCBTcGxhc2hzY3JlZW4gICBmcm9tICdzcGxhc2hzY3JlZW4vbW9kZWwnO1xuaW1wb3J0IE1lbnUgICAgICAgICAgIGZyb20gJ21lbnUvbW9kZWwnO1xuaW1wb3J0IEdhbWVDb250cm9sbGVyIGZyb20gJ2dhbWUtY29udHJvbGxlci9tb2RlbCc7XG5cbmNvbnN0IGxzID0gd2luZG93LmxvY2FsU3RvcmFnZTtcblxubGV0IGdsb2JhbFN0YXRlID0gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3Q7XG5cbmxldCBnYW1lU2V0dGluZ3M7XG5cblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKVxuXG5pbml0KCk7XG5cbnN1YnNjcmliZSggJ0dhbWU6OnJlc3RhcnQnLCBvblN0YXJ0R2FtZSApO1xuXG5zdWJzY3JpYmUoICdHYW1lOjplbmQnLCAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnd2lubmVyJyk7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaW4tZ2FtZScpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVudScpLmNsYXNzTGlzdC5hZGQoJ2ludHJvJyk7XG5cbiAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3BsYXNoc2NyZWVuLWNvbnRhaW5lcicpXG4gICk7XG5cbiAgaW5pdCgpO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgZSA9PiBlLnByZXZlbnREZWZhdWx0KCkgKTtcblxub25TZXR0aW5nc0NoYW5nZSh7XG4gIG51bUNvbm5lY3Q6IChscy5nZXRJdGVtKCdjb25uZWN0TW9yZV9udW1Db25uZWN0JykgfHwgNCkgLSAwLFxuICBudW1IdW1hbnM6IChscy5nZXRJdGVtKCdjb25uZWN0TW9yZV9udW1IdW1hbnMnKSB8fCAxKSAtIDAsXG4gIG51bUNvbXB1dGVyczogKGxzLmdldEl0ZW0oJ2Nvbm5lY3RNb3JlX251bUNvbXB1dGVycycpIHx8IDEpIC0gMCxcbiAgbnVtUGxheWVyczogKGxzLmdldEl0ZW0oJ2Nvbm5lY3RNb3JlX251bVBsYXllcnMnKSB8fCAyKSAtIDBcbn0pO1xuXG5mdW5jdGlvbiBvblNldHRpbmdzQ2hhbmdlKCBjb25maWcgPSB7fSApIHtcbiAgZ2FtZVNldHRpbmdzID0ge1xuICAgIGdyaWQ6IHtcbiAgICAgIGNvbHVtbnM6IDcsXG4gICAgICByb3dzOiA2LFxuICAgICAgbkNvbm5lY3Q6IGNvbmZpZy5udW1Db25uZWN0XG4gICAgfSxcbiAgICBwbGF5ZXJzOiAoKCkgPT4ge1xuXG4gICAgICBmdW5jdGlvbiBQbGF5ZXIoIGksIHR5cGUsIGRpZmZpY3VsdHkgPSAnJyApIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IGk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuZGlmZmljdWx0eSA9IGRpZmZpY3VsdHk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGh1bWFucyA9IGNvbmZpZy5udW1IdW1hbnNcbiAgICAgIGNvbnN0IGNvbXB1dGVycyA9IGNvbmZpZy5udW1Db21wdXRlcnNcbiAgICAgIGNvbnN0IHBsYXllcnMgPSBbXTtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaHVtYW5zOyBpKysgKSB7XG4gICAgICAgIHBsYXllcnMucHVzaCggbmV3IFBsYXllciggcGxheWVycy5sZW5ndGgsICdodW1hbicgKSApO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXB1dGVyczsgaSsrKSB7XG4gICAgICAgIHBsYXllcnMucHVzaCggbmV3IFBsYXllciggcGxheWVycy5sZW5ndGgsICdjb21wdXRlcicsICdpbXBvc3NpYmxlJyApICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbGF5ZXJzO1xuXG4gICAgfSkoKVxuICB9O1xufVxuXG5mdW5jdGlvbiBvblN0YXJ0R2FtZSgpIHtcbiAgd2luZG93LnNldFRpbWVvdXQoICgpID0+IHtcbiAgICBHYW1lQ29udHJvbGxlci5uZXdHYW1lKCBnYW1lU2V0dGluZ3MgKTtcbiAgICBnbG9iYWxTdGF0ZS5yZW1vdmUoICd3aW5uZXInICk7XG4gICAgZ2xvYmFsU3RhdGUuYWRkKCAnaW4tZ2FtZScgKTtcbiAgfSwgMTAwICk7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIFJlYWN0LnJlbmRlcihcbiAgICA8U3BsYXNoc2NyZWVuIHN0YXRlID0geyAndmlzaWJsZScgfSAvPixcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnI3NwbGFzaHNjcmVlbi1jb250YWluZXInIClcbiAgKTtcblxuICBSZWFjdC5yZW5kZXIoXG4gICAgPE1lbnUgXG4gICAgICBvblN0YXJ0R2FtZSA9IHsgb25TdGFydEdhbWUgfVxuICAgICAgb25TZXR0aW5nc0NoYW5nZSA9IHsgb25TZXR0aW5nc0NoYW5nZSB9IC8+LFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcjbWVudS1jb250YWluZXInIClcbiAgKTtcbn0iLCJpbXBvcnQge2NsYW1wfSBmcm9tICd1dGlsL2NvcmUnO1xuXG5pbXBvcnQgUGxheWVyICAgIGZyb20gJ3BsYXllci9tb2RlbCc7XG5pbXBvcnQgR3JpZCAgICAgIGZyb20gJ2dyaWQvbW9kZWwnO1xuaW1wb3J0IEdhbWVib2FyZCBmcm9tICdnYW1lYm9hcmQvbW9kZWwnO1xuXG5sZXQgZ2xvYmFsU3RhdGUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdDtcblxubGV0IGdhbWVib2FyZENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcjZ2FtZWJvYXJkLWNvbnRhaW5lcicgKTtcblxubGV0IGdyaWQ7XG5sZXQgdGlsZVNpemU7XG5cbmxldCBjYW5Nb3ZlID0gZmFsc2U7XG5sZXQgaGFzRW5kZWQgPSBmYWxzZTtcbmxldCB3aW5uaW5nUGxheWVyID0gZmFsc2U7XG5cbmxldCBwbGF5ZXJzO1xubGV0IHBsYXllcjtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBzZXRUaWxlU2l6ZSApO1xuXG5mdW5jdGlvbiBzZXRUaWxlU2l6ZSgpIHsgIFxuICB0aWxlU2l6ZSA9IGNsYW1wKCB3aW5kb3cuaW5uZXJXaWR0aCAvICggZ3JpZCAmJiBncmlkLmNvbHVtbnMgfHwgNyApLCAwLCAxMDAgKTtcblxuICB1cGRhdGUoKTtcbn1cblxuZnVuY3Rpb24gbmV3R2FtZSggY29uZmlnICkge1xuICBncmlkID0gbmV3IEdyaWQoIGNvbmZpZy5ncmlkICk7XG5cbiAgY2FuTW92ZSA9IHRydWU7XG4gIGhhc0VuZGVkID0gZmFsc2U7XG4gIHdpbm5pbmdQbGF5ZXIgPSBmYWxzZTtcblxuICBwbGF5ZXJzID0gY29uZmlnLnBsYXllcnMubWFwKCAoY29uZmlnKSA9PiBuZXcgUGxheWVyKCBjb25maWcgKSApO1xuICBwbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuXG4gIHNldFRpbGVTaXplKCk7XG59XG5cbmZ1bmN0aW9uIG9uV2luKCkge1xuICBnbG9iYWxTdGF0ZS5hZGQoICd3aW5uZXInICk7XG4gIGhhc0VuZGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb25QbGF5ZXJNb3ZlKCBjb2x1bW4gKSB7XG4gIGlmICggISBjYW5Nb3ZlIHx8IGhhc0VuZGVkICkgeyByZXR1cm47IH1cblxuICB3aW5uaW5nUGxheWVyID0gcGxheWVyXG4gICAgLmJlZ2luTW92ZSgpXG4gICAgLm1ha2VNb3ZlKCBncmlkLCBjb2x1bW4gKVxuICAgIC5lbmRNb3ZlKCBncmlkICk7XG5cbiAgdXBkYXRlKCk7XG5cbiAgaWYgKCB3aW5uaW5nUGxheWVyICkge1xuICAgIHJldHVybiB0aGlzLm9uV2luKCk7XG4gIH1cblxuICBuZXh0UGxheWVyKCk7XG4gIHVwZGF0ZSgpO1xuXG4gIGlmICggcGxheWVyLnR5cGUgPT0gJ2NvbXB1dGVyJyApIHtcbiAgICBjYW5Nb3ZlID0gZmFsc2U7XG4gICAgd2luZG93LnNldFRpbWVvdXQoIG9uQ29tcHV0ZXJNb3ZlLCAxMDAwICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Db21wdXRlck1vdmUoKSB7XG4gIHdpbm5pbmdQbGF5ZXIgPSBwbGF5ZXJcbiAgICAuYmVnaW5Nb3ZlKClcbiAgICAuZGVjaWRlTW92ZSggZ3JpZCwgcGxheWVycyApXG4gICAgLmVuZE1vdmUoIGdyaWQgKTtcblxuICB1cGRhdGUoKTtcblxuICBpZiAoIHdpbm5pbmdQbGF5ZXIgKSB7IFxuICAgIHJldHVybiBvbldpbigpOyBcbiAgfVxuXG4gIG5leHRQbGF5ZXIoKTtcbiAgdXBkYXRlKCk7XG4gIFxuICBpZiAoIHBsYXllci50eXBlID09ICdjb21wdXRlcicgKSB7XG4gICAgd2luZG93LnNldFRpbWVvdXQoIG9uQ29tcHV0ZXJNb3ZlLCAxMDAwICk7XG4gIH0gZWxzZSB7XG4gICAgY2FuTW92ZSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmV4dFBsYXllcigpIHtcbiAgcGxheWVyID0gKCBwbGF5ZXIuaW5kZXggPT09IHBsYXllcnMubGVuZ3RoIC0gMSApPyBwbGF5ZXJzWzBdIDogcGxheWVyc1sgcGxheWVyLmluZGV4ICsgMSBdO1xuICByZXR1cm4gcGxheWVyO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIFJlYWN0LnJlbmRlcihcbiAgICA8R2FtZWJvYXJkIFxuICAgICAgY3VycmVudFBsYXllciA9IHsgcGxheWVyIH1cbiAgICAgIHdpbm5pbmdQbGF5ZXIgPSB7IHdpbm5pbmdQbGF5ZXIgfVxuICAgICAgb25QbGF5ZXJNb3ZlID0geyBvblBsYXllck1vdmUgfVxuICAgICAgZ3JpZCA9IHsgZ3JpZCB9IFxuICAgICAgdGlsZVNpemUgPSB7IHRpbGVTaXplIH0gLz4sXG4gICAgZ2FtZWJvYXJkQ29udGFpbmVyXG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmV3R2FtZVxufSIsImltcG9ydCB7aGFzVG91Y2h9ICAgIGZyb20gJ3V0aWwvZGV2aWNlJztcblxuaW1wb3J0IEdhbWVib2FyZFRpbGUgZnJvbSAnZ2FtZWJvYXJkL2NvbHVtbi90aWxlL21vZGVsJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0dhbWVib2FyZENvbHVtbicsIFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaG92ZXJlZDogdGhpcy5wcm9wcy5ob3ZlcmVkIHx8IC0xXG4gICAgfTtcbiAgfSxcblxuICBvbk1vdXNlVXAoZSkge1xuICAgIGlmICggdGhpcy5wcm9wcy5kYXRhLmluZGV4T2YoIC0xICkgPT09IC0xICkgeyByZXR1cm47IH1cblxuICAgIHRoaXMucHJvcHMub25QbGF5ZXJNb3ZlKCBwYXJzZUludCggZS5jdXJyZW50VGFyZ2V0LmlkLCAxMCApIClcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgdGlsZXMgPSB0aGlzLnByb3BzLmRhdGEubWFwKCAoIHRpbGUsIGkgKSA9PiBcbiAgICAgIDxHYW1lYm9hcmRUaWxlIFxuICAgICAgICBrZXkgPSB7IGkgfVxuICAgICAgICBjbGFzc05hbWUgPSB7IHRoaXMuc3RhdGUuaG92ZXJlZCA9PT0gaT8gJ2hvdmVyZWQnOiAnJyB9XG4gICAgICAgIHRpbGVTaXplID0geyB0aGlzLnByb3BzLnRpbGVTaXplIH1cbiAgICAgICAgcGxheWVyQ2xhc3MgPSB7IGBwLSR7IHRpbGUgfWAgfSAvPlxuICAgICk7XG5cbiAgICBjb25zdCBzdHlsZSA9IHtcbiAgICAgICdoZWlnaHQnOiBgJHsgdGhpcy5wcm9wcy5oZWlnaHQgfXB4YCwgXG4gICAgICAnd2lkdGgnIDogYCR7IHRoaXMucHJvcHMudGlsZVNpemUgfXB4YFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBcbiAgICAgICAgb25Nb3VzZVVwID0geyBoYXNUb3VjaD8gdW5kZWZpbmVkOiB0aGlzLm9uTW91c2VVcCB9XG4gICAgICAgIGlkID0geyB0aGlzLnByb3BzLmlkIH1cbiAgICAgICAgc3R5bGUgPSB7IHN0eWxlIH1cbiAgICAgICAgY2xhc3NOYW1lID0geyBgZ2FtZWJvYXJkLWNvbHVtbiAkeyB0aGlzLnByb3BzLmhvdmVyZWQ/ICdob3ZlcmVkJzogJycgfWAgfSA+XG4gICAgICAgIHsgdGlsZXMgfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0dhbWVib2FyZFRpbGUnLCBcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgdGlsZVN0eWxlID0ge1xuICAgICAgd2lkdGggIDogYCR7IHRoaXMucHJvcHMudGlsZVNpemUgfXB4YCxcbiAgICAgIGhlaWdodCA6IGAkeyB0aGlzLnByb3BzLnRpbGVTaXplIH1weGBcbiAgICB9O1xuXG4gICAgY29uc3QgaW5uZXJTdHlsZSA9IHtcbiAgICAgIHdpZHRoICA6IGAkeyB0aGlzLnByb3BzLnRpbGVTaXplLTE0IH1weGAsIFxuICAgICAgaGVpZ2h0IDogYCR7IHRoaXMucHJvcHMudGlsZVNpemUtMTQgfXB4YFxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IFxuICAgICAgICBzdHlsZSA9IHsgdGlsZVN0eWxlIH1cbiAgICAgICAgY2xhc3NOYW1lID0geyBgJHsgdGhpcy5wcm9wcy5wbGF5ZXJDbGFzcyB9IGdhbWVib2FyZC10aWxlYCB9PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgc3R5bGU9eyBpbm5lclN0eWxlIH1cbiAgICAgICAgICBjbGFzc05hbWU9eyBgJHsgdGhpcy5wcm9wcy5jbGFzc05hbWUgfSBzaGFkb3dgIH0+PC9kaXY+XG4gICAgICAgIDxkaXYgXG4gICAgICAgICAgc3R5bGU9eyBpbm5lclN0eWxlIH1cbiAgICAgICAgICBjbGFzc05hbWUgPSB7IGBwaWVjZSAkeyB0aGlzLnByb3BzLnBsYXllckNsYXNzIH1gIH0+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTsiLCJpbXBvcnQgV2lubmVyTWVzc2FnZSAgICBmcm9tICdnYW1lYm9hcmQvd2luLW1vZGFsL21vZGVsJztcbmltcG9ydCBHYW1lYm9hcmRTdXJmYWNlIGZyb20gJ2dhbWVib2FyZC9zdXJmYWNlL21vZGVsJztcbmltcG9ydCBHYW1lYm9hcmRDb2x1bW4gIGZyb20gJ2dhbWVib2FyZC9jb2x1bW4vbW9kZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnR2FtZWJvYXJkJyxcbiAgY29sdW1uOiAwLFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaG92ZXJlZDogLTEsXG4gICAgfVxuICB9LFxuXG4gIG9uVG91Y2hNb3ZlKCBlICkge1xuICAgIHRoaXMuY29sdW1uID0gTWF0aC5mbG9vciggZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCAvIHRoaXMucHJvcHMudGlsZVNpemUgKTtcbiAgICBpZiAoIHRoaXMuY29sdW1uICE9PSB0aGlzLnN0YXRlLmhvdmVyZWQgKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXJlZDogdGhpcy5jb2x1bW4gfSk7XG4gICAgfVxuICB9LFxuXG4gIG9uVG91Y2hFbmQoIGUgKSB7XG4gICAgdGhpcy5jb2x1bW4gPSBNYXRoLmZsb29yKCBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC8gdGhpcy5wcm9wcy50aWxlU2l6ZSApO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcmVkOiAtMSB9KTtcbiAgICB0aGlzLnByb3BzLm9uUGxheWVyTW92ZSggdGhpcy5jb2x1bW4gKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLnByb3BzLmdyaWQuY29sdW1ucyAqIHRoaXMucHJvcHMudGlsZVNpemU7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wcm9wcy5ncmlkLnJvd3MgKiB0aGlzLnByb3BzLnRpbGVTaXplO1xuICAgIGNvbnN0IHN0eWxlID0geyBcbiAgICAgIHdpZHRoICA6IGAkeyB3aWR0aCB9cHhgLCBcbiAgICAgIGhlaWdodCA6IGAkeyBoZWlnaHQgfXB4YCwgXG4gICAgICBtYXJnaW4gOiBgNjBweCAtJHsgd2lkdGggLyAyIH1weGBcbiAgICB9O1xuXG4gICAgY29uc3QgY29sdW1ucyA9IHRoaXMucHJvcHMuZ3JpZC5kYXRhLm1hcCggKCBjb2x1bW4sIGkgKSA9PlxuICAgICAgPEdhbWVib2FyZENvbHVtbiBcbiAgICAgICAgb25QbGF5ZXJNb3ZlID0geyB0aGlzLnByb3BzLm9uUGxheWVyTW92ZSB9XG4gICAgICAgIGtleSA9IHsgaSB9XG4gICAgICAgIGlkID0geyBpIH1cbiAgICAgICAgZGF0YSA9IHsgY29sdW1uIH1cbiAgICAgICAgaGVpZ2h0ID0geyBoZWlnaHQgfSBcbiAgICAgICAgaG92ZXJlZCA9IHsgdGhpcy5zdGF0ZS5ob3ZlcmVkID09IGkgfVxuICAgICAgICB0aWxlU2l6ZSA9IHsgdGhpcy5wcm9wcy50aWxlU2l6ZSB9IC8+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvblxuICAgICAgICBvblRvdWNoTW92ZSA9IHsgdGhpcy5vblRvdWNoTW92ZSB9XG4gICAgICAgIG9uVG91Y2hFbmQgPSB7IHRoaXMub25Ub3VjaEVuZCB9XG5cbiAgICAgICAgc3R5bGUgPSB7IHN0eWxlIH1cbiAgICAgICAgaWQ9J2dhbWVib2FyZCc+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBpZD0nY3VycmVudC1wbGF5ZXInXG4gICAgICAgICAgY2xhc3NOYW1lID0geyBgcGxheWVyLSR7IHRoaXMucHJvcHMuY3VycmVudFBsYXllcj8gdGhpcy5wcm9wcy5jdXJyZW50UGxheWVyLmluZGV4ICsgMTogMCB9YCB9PlxuICAgICAgICAgICAgPGRpdj5QbGF5ZXIgMTwvZGl2PlxuICAgICAgICAgICAgPGRpdj5QbGF5ZXIgMjwvZGl2PlxuICAgICAgICAgICAgPGRpdj5QbGF5ZXIgMzwvZGl2PlxuICAgICAgICAgICAgPGRpdj5QbGF5ZXIgNDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyBjb2x1bW5zIH1cbiAgICAgICAgPEdhbWVib2FyZFN1cmZhY2VcbiAgICAgICAgICBuQ29ubmVjdCA9IHsgdGhpcy5wcm9wcy5ncmlkLm5Db25uZWN0IH1cbiAgICAgICAgICB3aWR0aCA9IHsgdGhpcy5wcm9wcy5ncmlkLmNvbHVtbnMgfVxuICAgICAgICAgIHRpbGVTaXplID0geyB0aGlzLnByb3BzLnRpbGVTaXplIH0gLz5cbiAgICAgICAgPFdpbm5lck1lc3NhZ2VcbiAgICAgICAgICB3aW5uaW5nUGxheWVyID0geyB0aGlzLnByb3BzLndpbm5pbmdQbGF5ZXIgfSAvPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH1cbn0pOyIsImltcG9ydCB7aGFzVG91Y2h9IGZyb20gJ3V0aWwvZGV2aWNlJztcbmltcG9ydCB7cHVibGlzaH0gIGZyb20gJ3V0aWwvbWVkaWF0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnR2FtZWJvYXJkU3VyZmFjZScsXG5cbiAgZ29Ub01lbnUoKSB7XG4gICAgcHVibGlzaCggJ0dhbWU6OmVuZCcgKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICB3aWR0aDogYCR7IHRoaXMucHJvcHMud2lkdGggKiB0aGlzLnByb3BzLnRpbGVTaXplIH1weGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgXG4gICAgICAgIGlkPSdnYW1lYm9hcmQtc3VyZmFjZScgXG4gICAgICAgIGNsYXNzTmFtZSA9IHsgdGhpcy5wcm9wcy5zdGF0ZSB9IFxuICAgICAgICBzdHlsZT0geyBzdHlsZSB9PlxuICAgICAgICA8ZGl2IFxuICAgICAgICAgIG9uVG91Y2hFbmQgPSB7IHRoaXMuZ29Ub01lbnUgfSBcbiAgICAgICAgICBvbkNsaWNrID0geyBoYXNUb3VjaD8gbnVsbDogdGhpcy5nb1RvTWVudSB9IFxuICAgICAgICAgIGlkPSdidG4tbWVudSc+RW5kIEdhbWU8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD0nbi1jb25uZWN0Jz57IHRoaXMucHJvcHMubkNvbm5lY3QgfSB0byBjb25uZWN0LjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7IiwiaW1wb3J0IHtoYXNUb3VjaH0gZnJvbSAndXRpbC9kZXZpY2UnOyAgICAgICAgICBcbmltcG9ydCB7cHVibGlzaH0gIGZyb20gJ3V0aWwvbWVkaWF0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnV2lubmVyTWVzc2FnZScsXG4gIFxuICBwbGF5QWdhaW4oKSB7XG4gICAgcHVibGlzaCggJ0dhbWU6OnJlc3RhcnQnICk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGNsYXNzTmFtZTogJycsIHBsYXllcjogJycgfSk7XG4gIH0sXG5cbiAgZ29Ub01lbnUoKSB7XG4gICAgcHVibGlzaCggJ0dhbWU6OmVuZCcgKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgXG4gICAgICBjbGFzc05hbWU6ICcnLCBcbiAgICAgIHBsYXllcjogJydcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCAhIHRoaXMucHJvcHMud2lubmluZ1BsYXllciApIHsgcmV0dXJuIDxkaXY+PC9kaXY+IH07XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSAoIHRoaXMucHJvcHMud2lubmluZ1BsYXllciApPyAnYWN0aXZlJzogJyc7XG4gICAgY29uc3QgcGxheWVyID0gdGhpcy5wcm9wcy53aW5uaW5nUGxheWVyIHx8IHt9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgaWQ9J3dpbm5lci1tZXNzYWdlJyBjbGFzc05hbWUgPSB7IGNsYXNzTmFtZSB9PlxuICAgICAgICA8ZGl2IGlkPSdtZXNzYWdlJz5cbiAgICAgICAgICBUaGUgdGl0bGUgb2YgPHNwYW4gY2xhc3NOYW1lPSdjaGFtcGlvbic+JmxkcXVvO0NoYW1waW9uJnJkcXVvOzwvc3Bhbj4gXG4gICAgICAgICAgaXMgaGVyZWJ5IGF3YXJkZWQgdG8gdGhlIHJlc3BlY3RlZCB7IHBsYXllci50eXBlIH0sIFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbmFtZSc+eyBwbGF5ZXIubmFtZSB9PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2IFxuICAgICAgICAgIG9uVG91Y2hFbmQgPSB7IHRoaXMucGxheUFnYWluIH0gXG4gICAgICAgICAgb25DbGljayA9IHsgaGFzVG91Y2g/IHVuZGVmaW5lZDogdGhpcy5wbGF5QWdhaW4gfSBcbiAgICAgICAgICBpZD0nYnRuLXBsYXktYWdhaW4nPlBsYXkgYWdhaW48L2Rpdj5cbiAgICAgICAgPGRpdiBcbiAgICAgICAgICBvblRvdWNoRW5kID0geyB0aGlzLmdvVG9NZW51IH0gXG4gICAgICAgICAgb25DbGljayA9IHsgaGFzVG91Y2g/IHVuZGVmaW5lZDogdGhpcy5nb1RvTWVudSB9IFxuICAgICAgICAgIGlkPSdidG4tbWVudSc+UmV0dXJuIHRvIG1lbnU8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWQge1xuICBjb25zdHJ1Y3RvciggY29uZmlnID0ge30gKSB7XG4gICAgdGhpcy5jb2x1bW5zICA9IGNvbmZpZy5jb2x1bW5zICB8fCA3O1xuICAgIHRoaXMucm93cyAgICAgPSBjb25maWcucm93cyAgICAgfHwgNjtcbiAgICB0aGlzLm5Db25uZWN0ID0gY29uZmlnLm5Db25uZWN0IHx8IDQ7XG5cbiAgICB0aGlzLl9kYXRhID0gW107XG5cbiAgICBmb3IgKCBsZXQgeCA9IDAsIGMgPSB0aGlzLmNvbHVtbnM7IHggPCBjOyB4KysgKSB7XG4gICAgICB0aGlzLl9kYXRhLnB1c2goIFsgXSApO1xuXG4gICAgICBmb3IgKCBsZXQgeSA9IDAsIHIgPSB0aGlzLnJvd3M7IHkgPCByOyB5KysgKSB7XG4gICAgICAgIHRoaXMuX2RhdGFbIHggXS5wdXNoKCAtMSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBkYXRhKCkgeyByZXR1cm4gdGhpcy5fZGF0YTsgfVxuXG4gIGluc2VydFBpZWNlKCBjb2x1bW4sIHBsYXllciApIHtcbiAgICBsZXQgciA9IHRoaXMucm93cztcblxuICAgIHdoaWxlICggci0tID4gMCApIHtcbiAgICAgIGlmICggdGhpcy5fZGF0YVsgY29sdW1uIF1bIHIgXSA9PT0gLTEgKSB7XG4gICAgICAgIHRoaXMuX2RhdGFbIGNvbHVtbiBdWyByIF0gPSBwbGF5ZXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB4OiBjb2x1bW4sIHk6IHIgfTtcbiAgfVxuXG4gIHJlbW92ZVBpZWNlKCBjb2x1bW4sIHJvdyApIHtcblxuICB9XG5cbiAgcGllY2VJc0luc2VydGFibGUoIGNvbHVtbiwgcm93KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX2RhdGFbIGNvbHVtbiBdICYmIFxuICAgICAgdGhpcy5fZGF0YVsgY29sdW1uIF1bIHJvdyBdICYmXG4gICAgICB0aGlzLl9kYXRhWyBjb2x1bW4gXVsgcm93IF0gPT09IC0xICYmXG4gICAgICB0aGlzLl9kYXRhWyBjb2x1bW4gXVsgcm93ICsgMSBdICE9PSAtMVxuICAgICk7XG4gIH1cblxuICBpc0ZpbGxlZCgpIHtcbiAgICBmb3IgKCBsZXQgaSA9IDAsIGNvbHVtbjsgY29sdW1uID0gdGhpcy5fZGF0YVsgaSBdOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDAsIHRpbGU7IHRpbGUgPSBjb2x1bW5bal07IGorKyApIHtcbiAgICAgICAgaWYgKCB0aWxlID09PSAtMSApIHsgXG4gICAgICAgICAgcmV0dXJuIGZhbHNlOyBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY2FuQ29udGludWVDaGFpbkluRGlyZWN0aW9uKGNvbHVtbiwgcm93LCBkaXIgPSB7IHg6IDAsIHk6IDAgfSkge1xuICAgIGNvbnN0IGdyaWQgPSB0aGlzLl9kYXRhO1xuXG4gICAgcmV0dXJuIHRoaXMucGllY2VJc0luc2VydGFibGUoIGNvbHVtbiArIGRpci54LCByb3cgKyBkaXIueSApIFxuICB9XG5cbiAgY2FuQ29tcGxldGVDaGFpbiggY29sdW1uLCByb3csIGRpciwgbmVlZGVkICkge1xuICAgIGNvbnN0IGdyaWQgPSB0aGlzLl9kYXRhO1xuXG4gICAgZm9yICggbGV0IGkgPSBuZWVkZWQ7IGkgPiAwOyBpLS0gKSB7XG4gICAgICBjb2x1bW4gPSBjb2x1bW4gKyBkaXIueDtcbiAgICAgIHJvdyA9IHJvdyArIGRpci55O1xuXG4gICAgICBpZiAoICEgdGhpcy5waWVjZUlzSW5zZXJ0YWJsZSggY29sdW1uLCByb3cgKSApIHsgYnJlYWs7IH1cblxuICAgICAgbmVlZGVkID0gbmVlZGVkIC0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gKCBuZWVkZWQgPT09IDAgKTtcbiAgfVxuXG4gIGZpbmRDaGFpbkNvbnRpbnVpbmdDb2x1bW4oY2hhaW4pIHtcbiAgICBjb25zdCBmaXJzdCA9IGNoYWluWzBdO1xuICAgIGNvbnN0IG0yICAgID0gY2hhaW5bMV07XG4gICAgY29uc3QgbTMgICAgPSBjaGFpbltjaGFpbi5sZW5ndGgtMl07XG4gICAgY29uc3QgbGFzdCAgPSBjaGFpbltjaGFpbi5sZW5ndGgtMV07XG5cbiAgICBjb25zdCBkeDEgPSBmaXJzdC54IC0gbTIueDtcbiAgICBjb25zdCBkeTEgPSBmaXJzdC55IC0gbTIueTtcblxuICAgIGNvbnN0IGR4MiA9IGxhc3QueCAtIG0zLng7XG4gICAgY29uc3QgZHkyID0gbGFzdC55IC0gbTMueTtcblxuICAgIGlmICggdGhpcy5waWVjZUlzSW5zZXJ0YWJsZSggZmlyc3QueCArIGR4MSwgZmlyc3QueSArIGR5MSApICkge1xuICAgICAgcmV0dXJuIHsgeDogZmlyc3QueCArIGR4MSwgeTogZmlyc3QueSwgZGlyOiB7IHg6IGR4MSwgeTogZHkxIH0gfTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMucGllY2VJc0luc2VydGFibGUoIGxhc3QueCArIGR4MiwgbGFzdC55ICsgZHkyICkgKSB7XG4gICAgICByZXR1cm4geyB4OiBsYXN0LnggKyBkeDIsIHk6IGZpcnN0LnksIGRpcjogeyB4OiBkeDIsIHk6IGR5MiB9IH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeDogLTEsIHk6IC0xIH07XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBvcHRpbWl6ZXMgYnkgb25seSBzdGFydGluZ1xuICAvLyBhdCB0aGUgbGFzdCB4LCB5IGNvb3JkaW5hdGUgYW5kIGNoZWNraW5nIG9ubHkgXG4gIC8vIHdoYXQncyBuZWNlc3NhcnlcbiAgbWFrZUNoYWluRnJvbVBvaW50KCB4LCB5LCBwLCBjID0gdGhpcy5uQ29ubmVjdCApIHtcbiAgICBjb25zdCB3ID0gdGhpcy5jb2x1bW5zO1xuICAgIGNvbnN0IGggPSB0aGlzLnJvd3M7XG4gICAgY29uc3QgZ3JpZCA9IHRoaXMuX2RhdGE7XG5cbiAgICAvLyBXZSBzZXQgbWF0Y2hlZCB0byAxIHNpbmNlIHdlIGFscmVhZHkga25vdyB0aGUgc3RhdHVzIG9mIFxuICAgIC8vIG91ciBjdXJyZW50IGNvb3JkaW5hdGVzXG4gICAgbGV0IG0gPSBbeyB4LCB5IH1dO1xuXG4gICAgLy8gVmVydGljYWwgdGVzdCBnb2luZyBkb3duXG4gICAgZm9yIChsZXQgaSA9IHkrMTsgaSA8IGg7IGkrKykge1xuICAgICAgaWYgKGdyaWRbeF1baV0gPT0gcCkgbS5wdXNoKHsgeCwgeTogaSB9KTtcbiAgICAgIGVsc2UgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKG0ubGVuZ3RoID49IGMpIHJldHVybiBtO1xuICAgIGVsc2UgbSA9IFt7IHgsIHkgfV07XG4gICAgXG4gICAgLy8gSG9yaXpvbnRhbCB0ZXN0IG1vdmluZyBsZWZ0IGFuZCByaWdodC5cbiAgICBmb3IgKGxldCBpID0geC0xOyBpID4gLTE7IGktLSkge1xuICAgICAgaWYgKGdyaWRbaV0gJiYgZ3JpZFtpXVt5XSA9PSBwKSBtLnVuc2hpZnQoeyB4OiBpLCB5IH0pO1xuICAgICAgZWxzZSBicmVhaztcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IHgrMTsgaSA8IHc7IGkrKykge1xuICAgICAgaWYgKGdyaWRbaV0gJiYgZ3JpZFtpXVt5XSA9PSBwKSBtLnB1c2goeyB4OiBpLCB5IH0pO1xuICAgICAgZWxzZSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAobS5sZW5ndGggPj0gYykgcmV0dXJuIG07XG4gICAgZWxzZSBtID0gW3sgeCwgeSB9XTtcblxuICAgIC8vIERpYWdvbmFsIHRlc3QgbW92aW5nIHVwLWxlZnQgYW5kIGRvd24tcmlnaHRcbiAgICBmb3IgKGxldCBpID0geC0xLCBqID0geS0xOyBpID4gLTEgJiYgaiA+IC0xOyBpLS0sIGotLSkge1xuICAgICAgaWYgKGdyaWRbaV0gJiYgZ3JpZFtpXVtqXSA9PSBwKSBtLnVuc2hpZnQoeyB4OiBpLCB5OiBqIH0pO1xuICAgICAgZWxzZSBicmVhaztcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IHgrMSwgaiA9IHkrMTsgaSA8IHcgJiYgaiA8IGg7IGkrKywgaisrKSB7XG4gICAgICBpZiAoZ3JpZFtpXSAmJiBncmlkW2ldW2pdID09IHApIG0ucHVzaCh7IHg6IGksIHk6IGogfSk7XG4gICAgICBlbHNlIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChtLmxlbmd0aCA+PSBjKSByZXR1cm4gbTtcbiAgICBlbHNlIG0gPSBbeyB4LCB5IH1dO1xuXG4gICAgLy8gRGlhZ29uYWwgdGVzdCBtb3ZpbmcgZG93bi1yaWdodCBhbmQgdXAtbGVmdFxuICAgIGZvciAobGV0IGkgPSB4KzEsIGogPSB5LTE7IGkgPCB3ICYmIGogPiAtMTsgaSsrLCBqLS0pIHtcbiAgICAgIGlmIChncmlkW2ldICYmIGdyaWRbaV1bal0gPT0gcCkgbS51bnNoaWZ0KHsgeDogaSwgeTogaiB9KTtcbiAgICAgIGVsc2UgYnJlYWs7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSB4LTEsIGogPSB5KzE7IGkgPiAtMSAmJiBqIDwgaDsgaS0tLCBqKyspIHtcbiAgICAgIGlmIChncmlkW2ldICYmIGdyaWRbaV1bal0gPT0gcCkgbS5wdXNoKHsgeDogaSwgeTogaiB9KTtcbiAgICAgIGVsc2UgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKG0ubGVuZ3RoID49IGMpIHJldHVybiBtO1xuICAgIGVsc2UgbSA9IFt7IHgsIHkgfV07XG5cbiAgICByZXR1cm4gbTtcbiAgfVxufTsiLCJpbXBvcnQge2hhc1RvdWNofSBmcm9tICd1dGlsL2RldmljZSc7XG5cbmltcG9ydCBTZXR0aW5ncyAgIGZyb20gJ21lbnUvc2V0dGluZ3MvbW9kZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTWVudScsXG4gIHRvU2tpcEludHJvOiBmYWxzZSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lbnVTdGF0ZTogJ2ludHJvJyxcbiAgICAgIGludHJvU3RhdGU6ICcnXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3RpdGxlJyApLmNsYXNzTGlzdC5hZGQoICdhY3RpdmUnICksIDEwMCApXG4gIH0sXG5cbiAgcGxheShlKSB7XG4gICAgdGhpcy5wcm9wcy5vblN0YXJ0R2FtZSgpO1xuICB9LFxuXG4gIHNldHRpbmdzKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1lbnVTdGF0ZTogKCB0aGlzLnN0YXRlLm1lbnVTdGF0ZSA9PT0gJ3NldHRpbmdzJyApPyAnJzogJ3NldHRpbmdzJ1xuICAgIH0pO1xuICB9LFxuXG4gIHNraXBJbnRybygpIHtcbiAgICBpZiAoIHRoaXMudG9Ta2lwSW50cm8gKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSggeyBpbnRyb1N0YXRlOiAnc2tpcC1pbnRybycgfSApO1xuICAgIHRoaXMudG9Ta2lwSW50cm8gPSB0cnVlO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiAgXG4gICAgICAgIGNsYXNzTmFtZSA9IHsgYCR7IHRoaXMuc3RhdGUubWVudVN0YXRlIH0gJHsgdGhpcy5zdGF0ZS5pbnRyb1N0YXRlIH1gIH0gXG4gICAgICAgIG9uVG91Y2hFbmQgPSB7IHRoaXMuc2tpcEludHJvIH1cbiAgICAgICAgaWQ9J21lbnUnPlxuICAgICAgICA8ZGl2IGlkPSd0aXRsZSc+XG4gICAgICAgICAgQ29ubmVjdCBNb3JlXG4gICAgICAgICAgPGRpdiBcbiAgICAgICAgICAgIG9uVG91Y2hFbmQgPSB7IHRoaXMucGxheSB9XG4gICAgICAgICAgICBvbkNsaWNrID0geyBoYXNUb3VjaD8gdW5kZWZpbmVkOiB0aGlzLnBsYXkgfSBcbiAgICAgICAgICAgIGlkPSdidG4tcGxheSc+SSBhY2NlcHQ8L2Rpdj5cbiAgICAgICAgICA8ZGl2IFxuICAgICAgICAgICAgb25Ub3VjaEVuZCA9IHsgdGhpcy5zZXR0aW5ncyB9XG4gICAgICAgICAgICBvbkNsaWNrID0geyBoYXNUb3VjaD8gdW5kZWZpbmVkOiB0aGlzLnNldHRpbmdzIH0gXG4gICAgICAgICAgICBpZD0nYnRuLXNldHRpbmdzJz5BcnJhbmdlbWVudHM8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxTZXR0aW5ncyBcbiAgICAgICAgICBvblN1Ym1pdCA9IHsgdGhpcy5zZXR0aW5ncyB9IFxuICAgICAgICAgIG9uU2V0dGluZ3NDaGFuZ2UgPSB7IHRoaXMucHJvcHMub25TZXR0aW5nc0NoYW5nZSB9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTsiLCJpbXBvcnQge2hhc1RvdWNofSBmcm9tICd1dGlsL2RldmljZSc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTZXR0aW5ncycsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIGNvbnN0IGxzICA9IHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gICAgY29uc3QgbkMgID0gbHMuZ2V0SXRlbSgnY29ubmVjdE1vcmVfbnVtQ29ubmVjdCcpICAgfHwgNDtcbiAgICBjb25zdCBuSCAgPSBscy5nZXRJdGVtKCdjb25uZWN0TW9yZV9udW1IdW1hbnMnKSAgICB8fCAxO1xuICAgIGNvbnN0IG5BSSA9IGxzLmdldEl0ZW0oJ2Nvbm5lY3RNb3JlX251bUNvbXB1dGVycycpIHx8IDE7XG4gICAgY29uc3QgblAgID0gbHMuZ2V0SXRlbSgnY29ubmVjdE1vcmVfbnVtUGxheWVycycpICAgfHwgMjtcbiAgICBjb25zdCBzcyAgPSBscy5nZXRJdGVtKCdjb25uZWN0TW9yZV9zb3VuZFN0YXRlJykgICB8fCAxO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG51bUNvbm5lY3Q6IG5DIC0gMCxcbiAgICAgIG51bUh1bWFuczogbkggLSAwLFxuICAgICAgbnVtQ29tcHV0ZXJzOiBuQUkgLSAwLFxuICAgICAgbnVtUGxheWVyczogblAgLSAwLFxuICAgICAgc291bmQ6IEJvb2xlYW4oIHNzIC0gMCApLFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGNvbnN0IGxzID0gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgICBscy5zZXRJdGVtKCdjb25uZWN0TW9yZV9udW1Db25uZWN0JywgdGhpcy5zdGF0ZS5udW1Db25uZWN0KTtcbiAgICBscy5zZXRJdGVtKCdjb25uZWN0TW9yZV9udW1IdW1hbnMnLCB0aGlzLnN0YXRlLm51bUh1bWFucyk7XG4gICAgbHMuc2V0SXRlbSgnY29ubmVjdE1vcmVfbnVtQ29tcHV0ZXJzJywgdGhpcy5zdGF0ZS5udW1Db21wdXRlcnMpO1xuICAgIGxzLnNldEl0ZW0oJ2Nvbm5lY3RNb3JlX251bVBsYXllcnMnLCB0aGlzLnN0YXRlLm51bVBsYXllcnMpO1xuXG4gICAgLy8gQm9vbCB0byBudW1iZXIgdG8gc3RyaW5nLCBvaCBteSFcbiAgICBscy5zZXRJdGVtKCAnY29ubmVjdE1vcmVfc291bmRTdGF0ZScsICcnICsgKCB0aGlzLnN0YXRlLnNvdW5kIC0gMCApICk7XG4gIH0sXG5cbiAgY2hhbmdlQ29ubmVjdChlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1Db25uZWN0OiBlLnRhcmdldC50ZXh0Q29udGVudC0wXG4gICAgfSk7XG4gIH0sXG5cbiAgY2hhbmdlUGxheWVyTnVtKGUpIHtcbiAgICBjb25zdCBudW0gPSBlLnRhcmdldC50ZXh0Q29udGVudC0wO1xuICAgIGNvbnN0IGNvbXBzID0gdGhpcy5zdGF0ZS5udW1Db21wdXRlcnM7XG4gICAgY29uc3QgaHVtYW5zID0gdGhpcy5zdGF0ZS5udW1IdW1hbnM7XG5cbiAgICBzd2l0Y2ggKGUudGFyZ2V0LmNsYXNzTGlzdFsxXSkge1xuICAgICAgY2FzZSAnbnVtLWh1bWFuLXBsYXllcnMnOlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBudW1IdW1hbnM6IG51bSxcbiAgICAgICAgICBudW1Db21wdXRlcnM6IChjb21wcyArIG51bSA+IDQpPyAoNCAtIG51bSk6IFxuICAgICAgICAgICAgKG51bSA8IDIgJiYgY29tcHMgPCAxKT8gMTogY29tcHNcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbnVtLWNvbXB1dGVyLXBsYXllcnMnOlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBudW1IdW1hbnM6IChodW1hbnMgKyBudW0gPiA0KT8gKDQgLSBudW0pOiBodW1hbnMsXG4gICAgICAgICAgbnVtQ29tcHV0ZXJzOiBudW1cbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogYnJlYWs7XG4gICAgfVxuICB9LFxuXG4gIHRvZ2dsZVNvdW5kKCkge1xuICAgIGNvbnN0IG5ld1N0YXRlID0gISB0aGlzLnN0YXRlLnNvdW5kO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NvdW5kOiBuZXdTdGF0ZX0pXG4gIH0sXG5cbiAgb25TdWJtaXQoKSB7XG4gICAgdGhpcy5wcm9wcy5vblNldHRpbmdzQ2hhbmdlKHRoaXMuc3RhdGUpO1xuICAgIHRoaXMucHJvcHMub25TdWJtaXQoKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgaWQ9J3NldHRpbmdzJz5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdudW0tY29ubmVjdCcgY2xhc3NOYW1lPSdjb250YWluZXInIGRhdGEtbnVtPXt0aGlzLnN0YXRlLm51bUNvbm5lY3R9PlxuICAgICAgICAgICAgPHNwYW4gb25Ub3VjaEVuZD17dGhpcy5jaGFuZ2VDb25uZWN0fSBvbkNsaWNrPXtoYXNUb3VjaD8gbnVsbDogdGhpcy5jaGFuZ2VDb25uZWN0fSBjbGFzc05hbWU9J29wdGlvbiBudW0tY29ubmVjdCc+Mzwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIG9uVG91Y2hFbmQ9e3RoaXMuY2hhbmdlQ29ubmVjdH0gb25DbGljaz17aGFzVG91Y2g/IG51bGw6IHRoaXMuY2hhbmdlQ29ubmVjdH0gY2xhc3NOYW1lPSdvcHRpb24gbnVtLWNvbm5lY3QnPjQ8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBvblRvdWNoRW5kPXt0aGlzLmNoYW5nZUNvbm5lY3R9IG9uQ2xpY2s9e2hhc1RvdWNoPyBudWxsOiB0aGlzLmNoYW5nZUNvbm5lY3R9IGNsYXNzTmFtZT0nb3B0aW9uIG51bS1jb25uZWN0Jz41PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSd0aXRsZSc+dG8gQ29ubmVjdDwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdudW0taHVtYW4tcGxheWVycycgY2xhc3NOYW1lPSdjb250YWluZXInIGRhdGEtbnVtPXt0aGlzLnN0YXRlLm51bUh1bWFuc30+XG4gICAgICAgICAgICA8c3BhbiBvblRvdWNoRW5kPXt0aGlzLmNoYW5nZVBsYXllck51bX0gb25DbGljaz17aGFzVG91Y2g/IG51bGw6IHRoaXMuY2hhbmdlUGxheWVyTnVtfSBjbGFzc05hbWU9J29wdGlvbiBudW0taHVtYW4tcGxheWVycyc+MTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIG9uVG91Y2hFbmQ9e3RoaXMuY2hhbmdlUGxheWVyTnVtfSBvbkNsaWNrPXtoYXNUb3VjaD8gbnVsbDogdGhpcy5jaGFuZ2VQbGF5ZXJOdW19IGNsYXNzTmFtZT0nb3B0aW9uIG51bS1odW1hbi1wbGF5ZXJzJz4yPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gb25Ub3VjaEVuZD17dGhpcy5jaGFuZ2VQbGF5ZXJOdW19IG9uQ2xpY2s9e2hhc1RvdWNoPyBudWxsOiB0aGlzLmNoYW5nZVBsYXllck51bX0gY2xhc3NOYW1lPSdvcHRpb24gbnVtLWh1bWFuLXBsYXllcnMnPjM8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBvblRvdWNoRW5kPXt0aGlzLmNoYW5nZVBsYXllck51bX0gb25DbGljaz17aGFzVG91Y2g/IG51bGw6IHRoaXMuY2hhbmdlUGxheWVyTnVtfSBjbGFzc05hbWU9J29wdGlvbiBudW0taHVtYW4tcGxheWVycyc+NDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0ndGl0bGUnPkh1bWFuIFBsYXllcnM8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nbnVtLWNvbXB1dGVyLXBsYXllcnMnIGNsYXNzTmFtZT0nY29udGFpbmVyJyBkYXRhLW51bT17dGhpcy5zdGF0ZS5udW1Db21wdXRlcnN9PlxuICAgICAgICAgICAgPHNwYW4gb25Ub3VjaEVuZD17dGhpcy5jaGFuZ2VQbGF5ZXJOdW19IG9uQ2xpY2s9e2hhc1RvdWNoPyBudWxsOiB0aGlzLmNoYW5nZVBsYXllck51bX0gY2xhc3NOYW1lPSdvcHRpb24gbnVtLWNvbXB1dGVyLXBsYXllcnMnPjA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBvblRvdWNoRW5kPXt0aGlzLmNoYW5nZVBsYXllck51bX0gb25DbGljaz17aGFzVG91Y2g/IG51bGw6IHRoaXMuY2hhbmdlUGxheWVyTnVtfSBjbGFzc05hbWU9J29wdGlvbiBudW0tY29tcHV0ZXItcGxheWVycyc+MTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIG9uVG91Y2hFbmQ9e3RoaXMuY2hhbmdlUGxheWVyTnVtfSBvbkNsaWNrPXtoYXNUb3VjaD8gbnVsbDogdGhpcy5jaGFuZ2VQbGF5ZXJOdW19IGNsYXNzTmFtZT0nb3B0aW9uIG51bS1jb21wdXRlci1wbGF5ZXJzJz4yPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gb25Ub3VjaEVuZD17dGhpcy5jaGFuZ2VQbGF5ZXJOdW19IG9uQ2xpY2s9e2hhc1RvdWNoPyBudWxsOiB0aGlzLmNoYW5nZVBsYXllck51bX0gY2xhc3NOYW1lPSdvcHRpb24gbnVtLWNvbXB1dGVyLXBsYXllcnMnPjM8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J3RpdGxlJz5Db21wdXRlciBQbGF5ZXJzPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD0nYnRuLWFtbWVuZCcgb25Ub3VjaEVuZD17dGhpcy5vblN1Ym1pdH0gb25DbGljaz17aGFzVG91Y2g/IG51bGw6IHRoaXMub25TdWJtaXR9PkFtbWVuZCByZWdpc3RyeTwvZGl2PlxuICAgICAgICA8ZGl2IGhpZGRlbj0ndHJ1ZScgaWQ9J2J0bi1zb3VuZC1zdGF0ZScgY2xhc3NOYW1lPXt0aGlzLnN0YXRlLnNvdW5kPyAnb24nOiAnb2ZmJ30+XG4gICAgICAgICAgPGRpdiBvblRvdWNoRW5kPXt0aGlzLnRvZ2dsZVNvdW5kfSBvbkNsaWNrPXtoYXNUb3VjaD8gbnVsbDogdGhpcy50b2dnbGVTb3VuZH0gY2xhc3NOYW1lPSdzb3VuZC1vcHRpb24nPlNvdW5kIG9uPC9kaXY+XG4gICAgICAgICAgPGRpdiBvblRvdWNoRW5kPXt0aGlzLnRvZ2dsZVNvdW5kfSBvbkNsaWNrPXtoYXNUb3VjaD8gbnVsbDogdGhpcy50b2dnbGVTb3VuZH0gY2xhc3NOYW1lPSdzb3VuZC1vcHRpb24nPlNvdW5kIG9mZjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pIiwiaW1wb3J0IHtyYW5kb21GbG9hdCwgcmFuZG9tSW50fSBmcm9tICd1dGlsL2NvcmUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuaW5kZXggPSBjb25maWcuaW5kZXg7XG4gICAgdGhpcy5uYW1lICA9IGNvbmZpZy5uYW1lIHx8IGBQbGF5ZXIgJHsgdGhpcy5pbmRleCsxIH1gO1xuICAgIHRoaXMudHlwZSAgPSBjb25maWcudHlwZSB8fCAnY29tcHV0ZXInO1xuICAgIHRoaXMubW92ZXMgPSBbXTtcbiAgICB0aGlzLmxvbmdlc3RDaGFpbnMgPSBbXTtcbiAgICB0aGlzLm5vdGVJbmRleCA9IDA7XG5cbiAgICBpZiAoIHRoaXMudHlwZSAhPT0gJ2NvbXB1dGVyJyApIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLmRpZmZpY3VsdHkgPSBjb25maWcuZGlmZmljdWx0eTtcbiAgICB0aGlzLmVycm9yRmFjdG9yID0gMC4xICogcmFuZG9tRmxvYXQoXG4gICAgICB0aGlzLmRpZmZpY3VsdHkgPT0gJ2Vhc3knPyA2LjY2OiB0aGlzLmRpZmZpY3VsdHkgPT0gJ21lZGl1bSc/IDMuMzM6IDAsXG4gICAgICB0aGlzLmRpZmZpY3VsdHkgPT0gJ2Vhc3knPyAxMC4wOiB0aGlzLmRpZmZpY3VsdHkgPT0gJ21lZGl1bSc/IDYuNjY6IDMuMzNcbiAgICApO1xuICAgIHRoaXMuZXJyb3JGYWN0b3IgPSAoIHRoaXMuZGlmZmljdWx0eSA9PT0gJ2ltcG9zc2libGUnICk/IDA6IHRoaXMuZXJyb3JGYWN0b3I7XG4gIH1cblxuICBiZWdpbk1vdmUoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBtYWtlTW92ZSggZ3JpZCwgY29sdW1uICkge1xuICAgIHRoaXMubW92ZXMucHVzaCggZ3JpZC5pbnNlcnRQaWVjZSggY29sdW1uLCB0aGlzLmluZGV4ICkgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGVuZE1vdmUoIGdyaWQgKSB7XG4gICAgdGhpcy5sb25nZXN0Q2hhaW5zID0gdGhpcy5maW5kTG9uZ2VzdENoYWluKGdyaWQsIGdyaWQubkNvbm5lY3QpO1xuXG4gICAgaWYgKHRoaXMubG9uZ2VzdENoYWlucy5maWx0ZXIoICggY2hhaW4gKSA9PiBjaGFpbi5sZW5ndGggPT09IGdyaWQubkNvbm5lY3QpWzBdICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZpbmRMb25nZXN0Q2hhaW4oIGdyaWQsIG1heCApIHtcbiAgICBsZXQgbG9uZ2VzdENoYWlucyA9IFsgXTtcbiAgICAvLyBXZSdsbCBtb3ZlIGZyb20gY2hhaW5zIHN0YXJpbmcgYXQgbGVuZ3RoIG9mIHR3byB1cCB0byB0aGUgbWF4IG51bWJlclxuICAgIGZvciAoIGxldCBpID0gMjsgaSA8IG1heDsgaSsrICkge1xuICAgICAgLy8gTm93IHdlJ2xsIGdvIHRob3VnaCBhbGwgdGhlIHBsYXllcidzIG1vdmVzXG4gICAgICBmb3IgKCBsZXQgaiA9IDAsIG1vdmU7IG1vdmUgPSB0aGlzLm1vdmVzW2pdOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGNoYWluID0gZ3JpZC5tYWtlQ2hhaW5Gcm9tUG9pbnQoIG1vdmUueCwgbW92ZS55LCB0aGlzLmluZGV4LCBpICk7XG4gICAgICAgIGxldCBzcGxpY2VkO1xuXG4gICAgICAgIGlmICggISBsb25nZXN0Q2hhaW5zLmxlbmd0aCApIHtcbiAgICAgICAgICBsb25nZXN0Q2hhaW5zLnB1c2goIGNoYWluICk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBsb25nZXN0Q2hhaW5zLmxlbmd0aDsgaysrICkge1xuICAgICAgICAgIGlmICggY2hhaW4ubGVuZ3RoID4gbG9uZ2VzdENoYWluc1trXS5sZW5ndGggKSB7XG4gICAgICAgICAgICBzcGxpY2VkID0gbG9uZ2VzdENoYWlucy5zcGxpY2UoaywgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBzcGxpY2VkICkgeyBcbiAgICAgICAgICBsb25nZXN0Q2hhaW5zLnB1c2goIGNoYWluICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RDaGFpbnM7XG4gIH1cblxuICAvLyBUaGUgQWxnb3JpdGhtIHRoYXQgdGhlIEFJIGZvbGxvd3MgaXMgcHJldHR5IHNpbXBsZS5cbiAgLy8gSWYgYSBzdGVwIGZhaWxzIGl0IHByb2NlZWRzIHRvIHRoZSBmb2xsb3dpbmcgc3RlcC5cbiAgLy9cbiAgLy8gKDEpIEl0IHRlc3RzIGl0cyBlcnJvciBmYWN0b3IgKGRlcml2ZWQgZnJvbSBpdHMgZGlmZmljdWx0eSBsZXZlbClcbiAgLy8gICAgIGFnYWluc3QgYSByYW5kb20gbnVtYmVyIGFuZCBpZiBpcyB3aXRoaW4gYSBzcGVjaWZpZWQgcmFuZ2UgaXQgXG4gIC8vICAgICBtYWxmdW5jdGlvbnMgYW5kIGRyb3BzIGEgcGllY2UgcmFuZG9tbHkuXG4gIC8vXG4gIC8vICgyKSBJdCBzZWFyY2hlcyBmb3IgYW55IHBsYXllciwgaW5jbHVkaW5nIGl0c2VsZiwgdGhhdCBpcyBcbiAgLy8gICAgIG9uZSBwbGF5IGF3YXkgZnJvbSB3aW5uaW5nLiBJdCB0aGVuIGVpdGhlciBibG9ja3MgdGhlXG4gIC8vICAgICBvdGhlciBwbGF5ZXIgZnJvbSB3aW5uaW5nIG9yIGF0dGVtcHRzIHRvIHdpbi5cbiAgLy9cbiAgLy8gKDMpIEl0IHNlYXJjaGVzIGZvciBhIGNoYWluIG9mIHBpZWNlcyB0aGF0IGl0IGhhcyBwcmV2aW91c2x5IG1hZGVcbiAgLy8gICAgIGFuZCBhZGRzIHRvIGl0IGlmIGl0IGlzIHBvc3NpYmxlIGFuZCBjYW4gZXZlbnR1YWxseSBsZWFkIHRvIGFcbiAgLy8gICAgIHdpbiBzY2VuYXJpby5cbiAgLy9cbiAgLy8gKDQpIEl0IHN0YXJ0cyBhIGNoYWluIGJ5IGZpbmRpbmcgYSBwcmV2aW91c2x5IGxhaWQgcGllY2UuXG4gIC8vIFxuICAvLyAoNSkgSXQgc2VhcmNoZXMgZm9yIGEgY2hhaW4gYW5vdGhlciBwbGF5ZXIgaXMgbWFraW5nIGFuZCBibG9ja3MgaXQuIFxuICAvL1xuICAvLyAoNikgSXQgcGxhY2VzIGEgcGllY2UgcmFuZG9tbHkuXG4gIC8vXG4gIGRlY2lkZU1vdmUoZ3JpZCwgcGxheWVycykge1xuICAgIC8vICgxKVxuICAgIC8vIGlmIChNYXRoLnJhbmRvbSgpIDwgdGhpcy5lcnJvckZhY3Rvcikge1xuICAgIC8vICAgcmV0dXJuIHRoaXMubWFrZU1vdmUoZ3JpZCwgcmFuZG9tSW50KDAsIGdyaWQuY29sdW1ucy0xKSk7XG4gICAgLy8gfVxuXG4gICAgLy8gKDIpXG4gICAgZm9yIChsZXQgaSA9IDAsIHBsYXllcjsgcGxheWVyID0gcGxheWVyc1tpXTsgaSsrKSB7XG4gICAgICBpZiAocGxheWVyLmluZGV4ID09PSB0aGlzLmluZGV4KSBicmVhaztcbiAgICAgIGZvciAobGV0IGogPSAwLCBjaGFpbjsgY2hhaW4gPSBwbGF5ZXIubG9uZ2VzdENoYWluc1tqXTsgaisrKSB7XG4gICAgICAgIGlmIChjaGFpbi5sZW5ndGggPT09IGdyaWQubkNvbm5lY3QtMSkge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBncmlkLmZpbmRDaGFpbkNvbnRpbnVpbmdDb2x1bW4oY2hhaW4pO1xuICAgICAgICAgIGlmIChkYXRhLnggPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFrZU1vdmUoZ3JpZCwgZGF0YS54KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAoMikgUHQuIDJcbiAgICBmb3IgKGxldCBqID0gMCwgY2hhaW47IGNoYWluID0gdGhpcy5sb25nZXN0Q2hhaW5zW2pdOyBqKyspIHtcbiAgICAgIGlmIChjaGFpbi5sZW5ndGggPT09IGdyaWQubkNvbm5lY3QtMSkge1xuICAgICAgICBjb25zdCBkYXRhID0gZ3JpZC5maW5kQ2hhaW5Db250aW51aW5nQ29sdW1uKGNoYWluKTtcbiAgICAgICAgaWYgKGRhdGEueCA+IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubWFrZU1vdmUoZ3JpZCwgZGF0YS54KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vICgzKSBUT0RPIGluY29tcGxldGVcbiAgICBmb3IgKGxldCBpID0gMCwgY2hhaW47IGNoYWluID0gdGhpcy5sb25nZXN0Q2hhaW5zW2ldOyBpKyspIHtcbiAgICAgIGlmIChjaGFpbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBncmlkLmZpbmRDaGFpbkNvbnRpbnVpbmdDb2x1bW4oY2hhaW4pO1xuICAgICAgICBpZiAoZGF0YS54ID4gLTEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5tYWtlTW92ZShncmlkLCBkYXRhLngpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gKDQpXG4gICAgZm9yIChsZXQgaSA9IDAsIG1vdmU7IG1vdmUgPSB0aGlzLm1vdmVzW2ldOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHggPSAoaSA8IDIpPyAtMTogKGkgPCAzKT8gMDogMTsgXG4gICAgICAgIGNvbnN0IHkgPSAoaSA8IDEpPyAgMDogKGkgPCA0KT8gMTogMDsgXG4gICAgICAgIGNvbnN0IGNhbkNvbXBsZXRlID0gZ3JpZC5jYW5Db21wbGV0ZUNoYWluKFxuICAgICAgICAgIG1vdmUueCxcbiAgICAgICAgICBtb3ZlLnksXG4gICAgICAgICAge3gsIHl9LFxuICAgICAgICAgIGdyaWQubkNvbm5lY3QtMVxuICAgICAgICApO1xuICAgICAgICBpZiAoY2FuQ29tcGxldGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5tYWtlTW92ZShncmlkLCBtb3ZlLnggKyB4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vICg1KVxuICAgIGZvciAobGV0IGkgPSAwLCBwbGF5ZXI7IHBsYXllciA9IHBsYXllcnNbaV07IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDAsIGNoYWluOyBjaGFpbiA9IHBsYXllci5sb25nZXN0Q2hhaW5zW2pdOyBqKyspIHtcbiAgICAgICAgaWYgKGNoYWluLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gZ3JpZC5maW5kQ2hhaW5Db250aW51aW5nQ29sdW1uKGNoYWluKTtcbiAgICAgICAgICBpZiAoZGF0YS54ID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1ha2VNb3ZlKGdyaWQsIGRhdGEueCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gKDYpXG4gICAgcmV0dXJuIHRoaXMubWFrZU1vdmUoZ3JpZCwgcmFuZG9tSW50KDAsIGdyaWQuY29sdW1ucy0xKSk7XG4gIH1cbn0iLCJpbXBvcnQgR2FtZWJvYXJkICAgZnJvbSAnZ2FtZWJvYXJkL21vZGVsJztcbmltcG9ydCBHcmlkICAgICAgICBmcm9tICdncmlkL21vZGVsJztcbmltcG9ydCBQbGF5ZXIgICAgICBmcm9tICdwbGF5ZXIvbW9kZWwnO1xuXG5sZXQgZ2xvYmFsU3RhdGUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdFxuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnU3BsYXNoc2NyZWVuJyxcbiAgcmVzaXplSWQ6IG51bGwsXG4gIGFkZFBpZWNlSWQ6IG51bGwsXG4gIHBsYXllcnM6IFtdLFxuICBwbGF5ZXI6IG51bGwsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIGNvbnN0IGdyaWQgPSBuZXcgR3JpZCh7IHJvd3M6IDE2LCBuQ29ubmVjdDogOTkgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdyaWQsXG4gICAgICB0aWxlU2l6ZTogd2luZG93LmlubmVyV2lkdGggLyBncmlkLmNvbHVtbnNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcy5yZXNpemUgKTtcblxuICAgIHRoaXMuaW5pdEZhdXhHYW1lKCk7XG4gICAgdGhpcy5hZGRQaWVjZUlkID0gd2luZG93LnNldFRpbWVvdXQoIHRoaXMuYWRkUmFuZG9tUGllY2UsIDUwMCApO1xuICB9LFxuXG4gIHJlc2l6ZSgpIHtcbiAgICBpZiAoIGdsb2JhbFN0YXRlLmNvbnRhaW5zKCAnaW4tZ2FtZScgKSApIHsgcmV0dXJuOyB9XG4gICAgXG4gICAgbGV0IHRpbGVTaXplID0gTWF0aC5mbG9vciggd2luZG93LmlubmVyV2lkdGggLyB0aGlzLnN0YXRlLmdyaWQuY29sdW1ucyApO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHRpbGVTaXplIH0pO1xuICB9LFxuXG4gIGluaXRGYXV4R2FtZSgpIHtcbiAgICB0aGlzLnBsYXllcnMgPSBbMCwgMSwgMiwgM10ubWFwKCAoaSkgPT4gbmV3IFBsYXllcih7IGluZGV4OiBpIH0pICk7IFxuICAgIHRoaXMucGxheWVyID0gdGhpcy5wbGF5ZXJzWzBdO1xuICB9LFxuXG4gIGFkZFJhbmRvbVBpZWNlKCkge1xuICAgIHRoaXMucGxheWVyXG4gICAgICAuYmVnaW5Nb3ZlKClcbiAgICAgIC5kZWNpZGVNb3ZlKHRoaXMuc3RhdGUuZ3JpZCwgdGhpcy5wbGF5ZXJzKVxuICAgICAgLmVuZE1vdmUodGhpcy5zdGF0ZS5ncmlkKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgZ3JpZDogdGhpcy5zdGF0ZS5ncmlkIH0pO1xuICAgIHRoaXMubmV4dFBsYXllcigpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuZ3JpZC5pc0ZpbGxlZCgpIHx8IFxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2luLWdhbWUnKSkgcmV0dXJuO1xuXG4gICAgdGhpcy5hZGRQaWVjZUlkID0gd2luZG93LnNldFRpbWVvdXQoIHRoaXMuYWRkUmFuZG9tUGllY2UsIDE1MCApO1xuICB9LFxuXG4gIG5leHRQbGF5ZXIoKSB7XG4gICAgdGhpcy5wbGF5ZXIgPSAoIHRoaXMucGxheWVyLmluZGV4ID09PSB0aGlzLnBsYXllcnMubGVuZ3RoIC0gMSApP1xuICAgICAgdGhpcy5wbGF5ZXJzWzBdIDogdGhpcy5wbGF5ZXJzW3RoaXMucGxheWVyLmluZGV4ICsgMV07XG4gICAgcmV0dXJuIHRoaXMucGxheWVyO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBpZD0nc3BsYXNoc2NyZWVuJyBjbGFzc05hbWUgPSB7IHRoaXMucHJvcHMuc3RhdGUgfT5cbiAgICAgICAgPEdhbWVib2FyZCBncmlkID0geyB0aGlzLnN0YXRlLmdyaWQgfSB0aWxlU2l6ZSA9IHsgdGhpcy5zdGF0ZS50aWxlU2l6ZSB9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KSIsImV4cG9ydCBmdW5jdGlvbiByYW5kb21JbnQoIG1pbiwgbWF4ICkge1xuICByZXR1cm4gTWF0aC5mbG9vciggbWluICsgTWF0aC5yYW5kb20oKSAqICggbWF4IC0gbWluICsgMSApICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21GbG9hdCggbWluLCBtYXggKSB7XG4gIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKCBtYXggLSBtaW4gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKCB4LCBtaW4sIG1heCApIHtcbiAgcmV0dXJuICggeCA8IG1pbiApID8gbWluIDogKCAoIHggPiBtYXggKSA/IG1heCA6IHggKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICByYW5kb21JbnQsXG4gIHJhbmRvbUZsb2F0LFxuICBjbGFtcFxufSIsImV4cG9ydCBjb25zdCBoYXNUb3VjaCA9IHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZDtcbmV4cG9ydCBjb25zdCBwdHJFbmFibGVkID0gbmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkIHx8IG5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkO1xuXG5leHBvcnQgY29uc3QgcHRyZG93biA9IHB0ckVuYWJsZWQ/ICdwb2ludGVyZG93bic6IGhhc1RvdWNoPyAndG91Y2hzdGFydCc6ICdtb3VzZWRvd24nO1xuZXhwb3J0IGNvbnN0IHB0cm1vdmUgPSBwdHJFbmFibGVkPyAncG9pbnRlcm1vdmUnOiBoYXNUb3VjaD8gJ3RvdWNobW92ZSc6ICdtb3VzZW1vdmUnO1xuZXhwb3J0IGNvbnN0IHB0cnVwID0gcHRyRW5hYmxlZD8gJ3BvaW50ZXJ1cCc6IGhhc1RvdWNoPyAndG91Y2hlbmQnOiAnbW91c2V1cCc7XG5cbmlmICghIGhhc1RvdWNoKSBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2Rlc2t0b3AnKSIsImxldCBjaGFubmVscyA9IG5ldyBNYXAoKTtcbmxldCBpZFByb3ZpZGVyID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2ggKG5hbWUsIGRhdGEpIHtcbiAgbGV0IGNoYW5uZWwgPSBjaGFubmVscy5nZXQobmFtZSk7XG4gIFxuICBpZiAoISBjaGFubmVsKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDAsIGlsID0gY2hhbm5lbC5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgY2hhbm5lbFtpXShkYXRhKTtcbiAgfVxufSBcblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnNjcmliZSAobmFtZSwgZnVuYykge1xuICBmdW5jLmlkID0gKytpZFByb3ZpZGVyO1xuICBpZiAoISBjaGFubmVscy5oYXMobmFtZSkpIGNoYW5uZWxzLnNldChuYW1lLCBbXSk7XG4gIGNoYW5uZWxzLmdldChuYW1lKS5wdXNoKGZ1bmMpO1xuICByZXR1cm4gaWRQcm92aWRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc3Vic2NyaWJlIChuYW1lLCBpZCkge1xuICBsZXQgY2hhbm5lbCA9IGNoYW5uZWxzLmdldChuYW1lKTtcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuXG4gIGlmICghIGNoYW5uZWwpIHRocm93IG5ldyBFcnJvcignTm8gY2hhbm5lbCB0byB1bnN1YnNjcmliZSBmcm9tLicpO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpbCA9IGNoYW5uZWwubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgIGlmIChjaGFubmVsW2ldLmlkID09PSBpZCkge1xuICAgICAgY2hhbm5lbC5zcGxpY2UoaSwgMSk7XG4gICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKCEgcmVzdWx0KSB0aHJvdyBuZXcgRXJyb3IoJ05vIGxpc3RlbmVyIHdhcyB1bnN1YnNjcmliZWQuJylcbn1cbiJdfQ==
