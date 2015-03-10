import Splashscreen   from 'splashscreen/model';
import Menu           from 'menu/model';
import GameController from 'game-controller/model';
import Sound          from 'sound/model'

const menuNode = document.querySelector('#menu-container');

let gameSettings;
let gameController;

function onSettingsChange(config = {}) {
  gameSettings = {
    grid: {
      columns: 7,
      rows: 6,
      nConnect: config.numConnect || 4
    },
    players: (() => {

      function Player(i, type, difficulty = '') {
        this.index = i;
        this.type = type;
        this.difficulty = difficulty;
      }

      const humans = config.numHumans || 1
      const computers = config.numComputers || 1
      const players = [];

      for (let i = 0; i < humans; i++) {
        players.push(new Player(players.length, 'human'));
      }

      for (let i = 0; i < computers; i++) {
        players.push(new Player(players.length, 'AI', 'impossible'));
      }

      return players;

    })()
  };
}

onSettingsChange();

function onStartGame() {
  React.unmountComponentAtNode(
    document.querySelector('#splashscreen-container')
  );
  React.unmountComponentAtNode(
    document.querySelector('#menu-container')
  );


  gameController = new GameController(gameSettings);
  document.body.classList.add('in-game');
}

function init(sound) {
  console.log('here')
  React.render(
    <Splashscreen />,
    document.querySelector('#splashscreen-container')
  );

  React.render(
    <Menu 
      sound={sound}
      onStartGame={onStartGame}
      onSettingsChange={onSettingsChange} />,
    document.querySelector('#menu-container')
  );
}

const sound = new Sound(init);

