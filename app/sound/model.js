Audio.prototype.fadeOut = function(done) {
  let fade = () => {
    if (this.volume - 0.01 <= 0) {
      this.volume = 0;
      return done();
    }

    if (this.volume >= 0) this.volume -= 0.05;

    window.setTimeout(fade, 1000/16);
  }

  window.setTimeout(fade, 1000/16);
}

export default class Sound {
  constructor(done) {
    this.menuBackground = new Audio('./build/Brandenburg Concerto No. 3 in G major, BWV1048 I ,  Allegro.mp3');
    this.gameBackground = new Audio('./build/Brandenburg Concerto No. 4 in G major, BWV1049 I , Allegro.mp3');
    this.loseBackground = new Audio('./build/Brandenburg Concerto No. 4 in G major, BWV1049 II , Andante.mp3');
    this.winBackground  = new Audio('./build/Brandenburg Concerto No. 1 in F major, BWV1046 III , Allegro.mp3');

    this.hitEffect   = new Audio('./build/Hit.mp3');
    this.clickEffect = new Audio('./build/Click.mp3')

    this.menuBackground.volume = 0.4;
    this.gameBackground.volume = 0.4;
    this.loseBackground.volume = 0.4;

    this.hitEffect.volume = 0.4;

    this.playing  = null;
    this.disabled = false;

    this.menuBackground.addEventListener('canplaythrough', () => {
      this.menuBackground.play();
      this.playing = this.menuBackground;
      done(this);
    });
  }

  play(type) {
    if (this.disabled) return;

    this.playing.fadeOut(() => {
      this[type].play()
      this.playing = this[type];
    });
  }

  playHitEffect() {
    window.setTimeout(() => {
      this.hitEffect.volume = 0.2;
      this.hitEffect.currentTime = 0;
      this.hitEffect.play();
    }, 500);
    window.setTimeout(() => {
      this.hitEffect.volume = 0.1;
      this.hitEffect.currentTime = 0;
      this.hitEffect.play();
    }, 900);
    window.setTimeout(() => {
      this.hitEffect.volume = 0.05;
      this.hitEffect.currentTime = 0;
      this.hitEffect.play();
    }, 1100);
  }
}