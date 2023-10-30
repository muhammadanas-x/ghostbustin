import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store';
import * as React from 'react';
import gsap from 'gsap';
import { loadAudio, playSample } from './helpers/audio';

export function Intro() {
  const pRef = React.useRef();
  const gRef = React.useRef();
  const { setAudioCtx, setAudioElement, setIntroDone } = useGameStore(
    useShallow((s) => ({ 
      setAudioCtx: s.setAudioCtx,
      setAudioElement: s.setAudioElement,
      setIntroDone: s.setIntroDone,
    })
  ));

  React.useLayoutEffect(() => {
    gsap.to(gRef.current, {opacity: 1, y: 0, duration: 1, delay: .5, ease: 'power4.Out'});
  }, []);

  const start = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    if (
      Object.prototype.hasOwnProperty.call(window, 'webkitAudioContext') &&
      !Object.prototype.hasOwnProperty.call(window, 'AudioContext')
    ) {
      window.AudioContext = window.webkitAudioContext;
    }
    const audioContext = new AudioContext();
    setAudioCtx(audioContext);

    const audioElement = new Audio('/shootloop3.m4a');
    //audioElement.loop = true;
    const volume = audioElement.volume;
    audioElement.volume = 0;
    audioElement.play().catch(() => {});
    audioElement.pause();
    audioElement.volume = volume;
    setAudioElement(audioElement);

    audioElement.addEventListener('timeupdate', function(){
      const buffer = .44;
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

    loadAudio(audioContext, '/PowerUp.m4a').then((buf) => {
      playSample(audioContext, buf);
    });
  }

  return (
    <div className="intro overlay" ref={pRef}>

<svg
    className='intro-img'
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeMiterlimit: 1.5,
    }}
    viewBox="0 0 525 571"
  >
    <path
      d="M1196.66 483.34A226.508 226.508 0 0 0 1036.5 417C911.491 417 810 518.491 810 643.5a226.5 226.5 0 0 0 66.34 160.16L1036.5 643.5l160.16-160.16Z"
      style={{
        fill: "none",
        stroke: "#ff0b0b",
        strokeWidth: "71.57px",
      }}
      transform="rotate(11.459 2318.454 -3382.211)"
    />
    <g className="ghost" ref={gRef}>
    <path
      d="M1028.18 365.35c25.77.077 85.15 29.44 94.28 95.564 12.51 90.578-26.37 182.859-33.25 216.598-13.84 67.865 19.22 126.725 22.16 148.123.93 6.703-11.43 20.174-18.81 5.634-18.04-35.508-38.19-58.863-68.26-91.134-13.84-14.855-77.789-74.55-86.857-177.941-7.775-88.653 10.733-197.082 90.737-196.844Z"
      style={{
        fill: "#fff",
        stroke: "#000",
        strokeWidth: "19.07px",
      }}
      transform="matrix(1.50966 -.15287 .1117 1.10305 -1385.233 -232.749)"
    />
    <path
      d="m982 425 31 27"
      style={{
        fill: "none",
        stroke: "#000",
        strokeWidth: "12.82px",
      }}
      transform="rotate(-5.782 -3930.904 12207.182) scale(1.36455)"
    />
    <path
      d="m982 425 31 27"
      style={{
        fill: "none",
        stroke: "#000",
        strokeWidth: "12.82px",
      }}
      transform="rotate(-91.837 533.348 940.662) scale(1.36455)"
    />
    <path
      d="m982 425 31 27"
      style={{
        fill: "none",
        stroke: "#000",
        strokeWidth: "12.82px",
      }}
      transform="rotate(-5.782 -4015.119 11228.171) scale(1.36455)"
    />
    <path
      d="m982 425 31 27"
      style={{
        fill: "none",
        stroke: "#000",
        strokeWidth: "12.82px",
      }}
      transform="rotate(-91.837 575.93 886.378) scale(1.36455)"
    />
    <ellipse
      cx={1006}
      cy={461}
      rx={20}
      ry={28}
      transform="matrix(1.42566 -.14436 .13897 1.37241 -1267.72 -279.84)"
    />
    </g>
    <path
      d="M1196.66 483.34A226.508 226.508 0 0 0 1036.5 417C911.491 417 810 518.491 810 643.5a226.5 226.5 0 0 0 66.34 160.16L1036.5 643.5l160.16-160.16Z"
      style={{
        fill: "none",
        stroke: "#ff0b0b",
        strokeWidth: "71.57px",
      }}
      transform="rotate(-168.541 632.59 514.876)"
    />
  </svg>

      <h1>Apparition Apprehension</h1>
      <button className="start-btn" onClick={start}>Play</button>
    </div>
  )
}
