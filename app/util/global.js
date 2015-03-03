export default class GLOBAL {
  constructor() {
    this._nConnect = 4;
    this._nPlayers = 2;

    this._player = 0;
  }

  get grid() { return this._grid; }
  set grid(optns) { 
    this._grid.columns = optns.columns || this._grid.columns;
    this._grid.height = optns.height || this._grid.height;
    this._grid.tileSize = optns.tileSize || this._grid.tileSize;
  }

  get nConnect()  { return this._nConnect; }
  set nConnect(n) { this._nConnect = n; }

  get nPlayers()  { return this._nPlayers; }
  get nPlayers(n) { this._nPlayers = n; }

  get player() { return this._player; }
  nextPlayer() { 
    this._player = this._player == this._nPlayers - 1?
      0 : this._player + 1;
  }
};

