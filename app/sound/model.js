import {randomInt} from 'util/core'

Audio.prototype.fadeOut = function() {
  function fade() {
    if (this.volume - 0.05 >= 0) {
      this.volume = 0;
      return;
    }

    if (this.volume >= 0) this.volume -= 0.05;

    window.setTimeout(fade, 25);
  }

  window.setTimeout(fade, 25);
}

export default class Sound {
  constructor(done) {
    this.background = new Audio('./build/bach.mp3');
    this.moveSound  = new Audio('http://javanese.imslp.info/files/imglnks/usimg/3/3f/IMSLP83273-PMLP151919-bach_bwv1006.mp3');

    this.background.volume = 0.4;
    console.log('doop')

    this.background.addEventListener('canplaythrough', () => {
      done(this);
      this.background.currentTime = 1.8;
      this.background.play();
    });

  }

  playRandMove() {
    this.moveSound.volume = 0
    this.moveSound.currentTime = randomInt(0, 180);

    let id1, id2;

    function int1() {
      this.moveSound.volume += 0.05;
      if (this.moveSound.volume > 0.4) {
        window.clearInterval(id1);
        id2 = window.setInterval(int2, 30);
      }
    }

    function int2() {
      this.moveSound.volume -= 0.05;
      if (this.moveSound.volume <= 0) {
        window.clearInterval(id2)
      }
    }

    id1 = setInterval(int1, 30);
  }
}