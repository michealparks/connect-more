import {audioContext, fixOscillator} from 'sound/tools';
import Reverb from 'sound/reverb';

// Example showing how to produce a tone using Web Audio API.
// Load the file webaudio_tools.js before loading this file.
// This code will write to a DIV with an id="soundStatus".
var oscillator;
var amp;
var distortion;

var reverb = new Reverb(audioContext, { seconds: 0.5, decay: 6, reverse: 0 });

// Create an oscillator and an amplifier.
// function initAudio() {
    // Use audioContext from webaudio_tools.js

if (audioContext) {

  oscillator = audioContext.createOscillator();
  fixOscillator(oscillator);
  oscillator.frequency.value = 440;
  oscillator.type = 'sine';
  amp = audioContext.createGain();
  amp.gain.value = 0;

  // Connect oscillator to amp and amp to the mixer of the audioContext.
  // This is like connecting cables between jacks on a modular synth.
  oscillator.connect(amp);
  amp.connect(reverb.input)
  reverb.connect(audioContext.destination);
  oscillator.start(0);
  // writeMessageToID( "soundStatus", "<p>Audio initialized.</p>");

}

// }

// Set the frequency of the oscillator and start it running.
function startTone( frequency, time ) {
  let now = audioContext.currentTime;
  
  oscillator.frequency.setValueAtTime(frequency, now);
  
  // Ramp up the gain so we can hear the sound.
  // We can ramp smoothly to the desired value.
  // First we should cancel any previous scheduled events that might interfere.
  amp.gain.cancelScheduledValues(now);
  // Anchor beginning of ramp at current value.
  amp.gain.setValueAtTime(amp.gain.value, now);
  amp.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.005);

  window.setTimeout(stopTone, time);
  
  // writeMessageToID( "soundStatus", "<p>Play tone at frequency = " + frequency  + "</p>");
}

function stopTone() {
  let now = audioContext.currentTime;
  amp.gain.cancelScheduledValues(now);
  amp.gain.setValueAtTime(amp.gain.value, now);
  amp.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + 0.5);
  // writeMessageToID( "soundStatus", "<p>Stop tone.</p>");
}

export default {
  startTone,
  stopTone
}