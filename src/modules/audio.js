import miss from '../assets/audio/miss.mp3';
import hit from '../assets/audio/explosion.mp3';
import sunk from '../assets/audio/destroyed.mp3';
import victory from '../assets/audio/victory.mp3';
import defeat from '../assets/audio/defeat.mp3';
import click from '../assets/audio/mouse-click-290204.mp3';



let audioEnabled = true;
let globalVol = 0.5;


const createSound = (file) => {
  const sound = new Audio(file)
  sound.muted = !audioEnabled
  sound.volume = globalVol
  return sound
}
export const audio = {
  miss: () => createSound(miss),
  hit: () => createSound(hit),
  sunk: () => createSound(sunk),
  victory: () => createSound(victory),
  defeat: () => createSound(defeat),
  click: () => createSound(click),
};



export function setAudio(enabled,volume = globalVol){
    audioEnabled = enabled
    globalVol = volume
}