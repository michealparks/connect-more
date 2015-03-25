Array.prototype.shuffle = function() {
  var l = this.length + 1;
  while (l--) {
    var r = ~~(Math.random() * l);
    var o = this[r];

    this[r] = this[0];
    this[0] = o;
  }

  return this;
};

Array.prototype.last = function(set) {
  if (set !== null || set !== undefined) {
    this[this.length-1] = set;
    return;
  }

  return this[this.length-1];
}