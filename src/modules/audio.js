import miss from '../assets/audio/miss.mp3';
import fired from '../assets/audio/shotFired.mp3';
import hit from '../assets/audio/shipHit.mp3';
import sunk from '../assets/audio/destroyed.mp3';
import victory from '../assets/audio/victory.mp3';
import defeat from '../assets/audio/defeat.mp3';
import click from '../assets/audio/mouse-click-290204.mp3';



let audioEnabled = true;
let globalVol = 0.5;

export const audio = {
  miss: new Audio(miss),
  fired: new Audio(fired),
  hit: new Audio(hit),
  sunk: new Audio(sunk),
  victory: new Audio(victory),
  defeat: new Audio(defeat),
  click: new Audio(click),
};

export function setAudio(enabled,volume = globalVol){
    audioEnabled = enabled
    globalVol = volume

    Object.values(audio).forEach(sound => {
        sound.mute = !audioEnabled
        sound.volume = globalVol
    })

   
}