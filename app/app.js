import Splashscreen   from 'splashscreen/model';
import Menu           from 'menu/model';
import GameController from 'game-controller/model';

function getGameConfig() {
  return {
    grid: {
      columns: 7,
      rows: 6,
      nConnect: 4 
    },

    players: [
      {
        name: 'bob',
        type: 'human'
      }, {
        name: 'jerry',
        type: 'AI',
        difficulty: 'impossible'
      }
    ]
  };
}

const gameController = new GameController(getGameConfig());

// React.render(
//   <Splashscreen />,
//   document.querySelector('#splashscreen-container')
// );

