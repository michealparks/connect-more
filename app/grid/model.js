export default class Grid {
  constructor(config = {}) {
    this.columns  = config.columns  || 7;
    this.rows     = config.rows     || 6;
    this.nConnect = config.nConnect || 4;

    this._data = [];
    for (let x = 0, c = this.columns; x < c; x++) {
      this._data.push([]);
      for (let y = 0, r = this.rows; y < r; y++) {
        this._data[x].push(-1);
      }
    }
  }

  get data() { return this._data; }

  insertPiece(column, player) {
    let r = this.rows;
    while (r-- > 0) {
      if (this._data[column][r] === -1) {
        this._data[column][r] = player;
        break;
      }
    }
    return { x: column, y: r };
  }

  removePiece(column, row) {

  }

  pieceIsInsertable(column, row) {
    return (
      this._data[column] && 
      this._data[column][row] &&
      this._data[column][row] === -1
    );
  }

  isFilled() {
    for (let i = 0, column; column = this._data[i]; i++) {
      for (let j = 0, tile; tile = column[j]; j++) {
        if (tile === -1) return false;
      }
    }

    return true;
  }

  canContinueChainInDirection(column, row, dir = { x: 0, y: 0 }) {
    const grid = this._data;

    if (dir.x == 0) {

      return (
        this.pieceIsInsertable(column, row-1)
      );

    } else {

      return (
        this.pieceIsInsertable(column + dir, row) ||
        this.pieceIsInsertable(column + dir, row-1)
      );

    }    
  }

  canCompleteChain(column, row, dir, needed) {
    const grid = this._data;

    for (let i = needed; i > 0; i--) {
      column = column + dir.x;
      row = row + dir.y;
      if (! this.pieceIsInsertable(column, row)) break;
      needed = needed - 1;
    }

    return (needed == 0);
  }

  findChainContinuingColumn(chain) {
    const first = chain[0];
    const m2    = chain[1];
    const m3    = chain[chain.length-2];
    const last  = chain[chain.length-1];

    const dx1 = first.x - m2.x;
    const dy1 = first.y - m2.y;

    const dx2 = last.x - m3.x;
    const dy2 = last.y - m3.y;

    if (this.canContinueChainInDirection(first.x, first.y, { x: dx1, y: dy1 })) {
      return { x: first.x + dx1, y: first.y, dir: { x: dx1, y: dy1 } };
    }

    if (this.canContinueChainInDirection(last.x, last.y, { x: dx2, y: dy2 })) {
      return { x: last.x + dx2, y: first.y, dir: { x: dx2, y: dy2 } };
    }

    return { x: -1, y: -1 };
  }

  // This method optimizes by only starting
  // at the last x, y coordinate and checking only 
  // what's necessary
  makeChainFromPoint(x, y, p, c = this.nConnect) {
    const w = this.columns;
    const h = this.rows;
    const grid = this._data;

    // We set matched to 1 since we already know the status of 
    // our current coordinates
    let m = [{ x, y }];

    // Vertical test going down
    for (let i = y+1; i < h; i++) {
      if (grid[x][i] == p) m.push({ x, y: i });
    }

    if (m.length >= c) return m;
    else m = [{ x, y }];
    
    // Horizontal test moving left and right.
    for (let i = x-1; i > -1; i--) {
      if (grid[i] && grid[i][y] == p) m.unshift({ x: i, y });
    }
    for (let i = x+1; i < w; i++) {
      if (grid[i] && grid[i][y] == p) m.push({ x: i, y });
    }

    if (m.length >= c) {
      return m;
    }
    else m = [{ x, y }];

    // Diagonal test moving up-left and down-right
    for (let i = x-1, j = y-1; i > -1 && j > -1; i--, j--) {
      if (grid[i] && grid[i][j] == p) m.unshift({ x: i, y: j });
    }
    for (let i = x+1, j = y+1; i < w && j < h; i++, j++) {
      if (grid[i] && grid[i][j] == p) m.push({ x: i, y: j });
    }

    if (m.length >= c) return m;
    else m = [{ x, y }];

    // Diagonal test moving down-right and up-left
    for (let i = x+1, j = y-1; i < w && j > -1; i++, j--) {
      if (grid[i] && grid[i][j] == p) m.unshift({ x: i, y: j });
    }
    for (let i = x-1, j = y+1; i > -1 && j < h; i--, j++) {
      if (grid[i] && grid[i][j] == p) m.push({ x: i, y: j });
    }

    if (m.length >= c) return m;
    else m = [{ x, y }];

    return m;
  }
};