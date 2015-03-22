class Sound {
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
    this.winBackground.volume  = 0.4;

    this.hitEffect.volume = 0.4;
    this.clickEffect.volume = 0.4;

    this.playing = null;
    this.enabled = Boolean(localStorage.getItem('connectMore_soundState') - 0)
  }

  disable(bool) {
    this.enabled = bool;
    if (this.playing && ! this.enabled) {
      this.fadeOut(this.playing);
    } else {
      this.menuBackground.play();
    }
  }

  play(type) {
    if (! this.enabled) return;

    if (this.playing) {
      this.fadeOut(this.playing, () => {
        this[type].play()
        this.playing = this[type];
      });
    } else {
      this[type].play()
      this.playing = this[type];
    }
  }

  fadeOut(sound, done) {
    let fade = () => {
      if (sound.volume - 0.01 <= 0) {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = 0.4;
        return done && done();
      }

      if (sound.volume >= 0) sound.volume -= 0.05;

      window.setTimeout(fade, 1000/16);
    }

    window.setTimeout(fade, 1000/16);
  }

  playHitEffect() {
    window.setTimeout(() => {
      this.hitEffect.volume = 0.1;
      this.hitEffect.currentTime = 0;
      this.hitEffect.play();
    }, 500);
    window.setTimeout(() => {
      this.hitEffect.volume = 0.05;
      this.hitEffect.currentTime = 0;
      this.hitEffect.play();
    }, 900);
    window.setTimeout(() => {
      this.hitEffect.volume = 0.025;
      this.hitEffect.currentTime = 0;
      this.hitEffect.play();
    }, 1100);
  }
}

export default new Sound();