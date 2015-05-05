import {clamp} from 'util/core';

import Player    from 'player/model';
import Grid      from 'grid/model';
import Gameboard from 'gameboard/model';

let globalState = document.body.classList;

let gameboardContainer = document.querySelector( '#gameboard-container' );

let grid;
let tileSize;

let canMove = false;
let hasEnded = false;
let winningPlayer = false;

let players;
let player;

window.addEventListener( 'resize', setTileSize );

function setTileSize() {  
  tileSize = clamp( window.innerWidth / ( grid && grid.columns || 7 ), 0, 100 );

  update();
}

function newGame( config ) {
  grid = new Grid( config.grid );

  canMove = true;
  hasEnded = false;
  winningPlayer = false;

  players = config.players.map( (config) => new Player( config ) );
  player = players[0];

  setTileSize();
}

function onWin() {
  globalState.add( 'winner' );
  hasEnded = true;
}

function onPlayerMove( column ) {
  if ( ! canMove || hasEnded ) { return; }

  winningPlayer = player
    .beginMove()
    .makeMove( grid, column )
    .endMove( grid );

  update();

  if ( winningPlayer ) {
    return this.onWin();
  }

  nextPlayer();
  update();

  if ( player.type == 'computer' ) {
    canMove = false;
    window.setTimeout( onComputerMove, 1000 );
  }
}

function onComputerMove() {
  winningPlayer = player
    .beginMove()
    .decideMove( grid, players )
    .endMove( grid );

  update();

  if ( winningPlayer ) { 
    return onWin(); 
  }

  nextPlayer();
  update();
  
  if ( player.type == 'computer' ) {
    window.setTimeout( onComputerMove, 1000 );
  } else {
    canMove = true;
  }
}

function nextPlayer() {
  player = ( player.index === players.length - 1 )? players[0] : players[ player.index + 1 ];
  return player;
}

function update() {
  React.render(
    <Gameboard 
      currentPlayer = { player }
      winningPlayer = { winningPlayer }
      onPlayerMove = { onPlayerMove }
      grid = { grid } 
      tileSize = { tileSize } />,
    gameboardContainer
  );
}

export default {
  newGame
}