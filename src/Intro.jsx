import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store';
import * as React from 'react';
import gsap from 'gsap';
import { loadAudio, playSample } from './helpers/audio';

export function Intro() {
  const pRef = React.useRef();
  const { setAudioCtx, setAudioElement, setIntroDone } = useGameStore(
    useShallow((s) => ({ 
      setAudioCtx: s.setAudioCtx,
      setAudioElement: s.setAudioElement,
      setIntroDone: s.setIntroDone,
    })
  ));

  const start = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    if (
      Object.prototype.hasOwnProperty.call(window, 'webkitAudioContext') &&
      !Object.prototype.hasOwnProperty.call(window, 'AudioContext')
    ) {
      window.AudioContext = window.webkitAudioContext;
    }
    const audioContext = new AudioContext();
    console.log('audioContext', audioContext);
    setAudioCtx(audioContext);

    const audioElement = new Audio('/shootloop.mp3');
    //audioElement.loop = true;
    const volume = audioElement.volume;
    audioElement.volume = 0;
    audioElement.play().catch(() => {});
    audioElement.pause();
    audioElement.volume = volume;
    setAudioElement(audioElement);

    audioElement.addEventListener('timeupdate', function(){
      const buffer = .25;
      if(this.currentTime > this.duration - buffer){
          this.currentTime = 0
          this.play()
      }
    });

    gsap.to(pRef.current, {
      autoAlpha: 0, 
      duration: .5,
      onComplete: () => {
        setIntroDone(true);
      }
    })

    loadAudio(audioContext, '/powerup.mp3').then((buf) => {
      playSample(audioContext, buf);
    });
  }

  return (
    <div className="intro" ref={pRef}>      
      <img src="/noghost.svg" width="50" height="50" alt="" className="intro-img" />
      <h1>Ghostbustin &rsquo;</h1>
      <button className="start-btn" onClick={start}>Play</button>
    </div>
  )
}
