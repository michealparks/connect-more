import {subscribe}    from 'util/mediator';
 
import Splashscreen   from 'splashscreen/model';
import Menu           from 'menu/model';
import GameController from 'game-controller/model';
import Sound          from 'sound/model'

const ls = window.localStorage;

let gameSettings;

React.initializeTouchEvents(true)

init();

subscribe('Game::restart', onStartGame);

subscribe('Game::end', () => {
  document.body.classList.remove('in-game');
  document.querySelector('#menu').classList.add('intro');

  React.unmountComponentAtNode(
    document.querySelector('#splashscreen-container')
  );

  init();
});

window.addEventListener('touchmove', e => e.preventDefault());

onSettingsChange({
  numConnect: (ls.getItem('connectMore_numConnect') || 4) - 0,
  numHumans: (ls.getItem('connectMore_numHumans') || 1) - 0,
  numComputers: (ls.getItem('connectMore_numComputers') || 1) - 0,
  numPlayers: (ls.getItem('connectMore_numPlayers') || 2) - 0
});

function onSettingsChange(config = {}) {
  gameSettings = {
    grid: {
      columns: 7,
      rows: 6,
      nConnect: config.numConnect
    },
    players: (() => {

      function Player(i, type, difficulty = '') {
        this.index = i;
        this.type = type;
        this.difficulty = difficulty;
      }

      const humans = config.numHumans
      const computers = config.numComputers
      const players = [];

      for (let i = 0; i < humans; i++) {
        players.push(new Player(players.length, 'human'));
      }

      for (let i = 0; i < computers; i++) {
        players.push(new Player(players.length, 'computer', 'impossible'));
      }

      return players;

    })()
  };
}

function onStartGame() {
  GameController.newGame(gameSettings);
  document.body.classList.add('in-game');
}

function init() {
  Sound.play('menuBackground');

  React.render(
    <Splashscreen state={'visible'} />,
    document.querySelector('#splashscreen-container')
  );

  React.render(
    <Menu 
      Sound={Sound}
      onStartGame={onStartGame}
      onSettingsChange={onSettingsChange} />,
    document.querySelector('#menu-container')
  );
}