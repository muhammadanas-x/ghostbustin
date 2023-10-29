import * as React from 'react';

export const loadAudio = async (audioContext, filepath) => {
  if (!filepath) return null;

  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  //callback here for Safari only !
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer, () => {
    return;
  });
  return audioBuffer;
};

export const playSample = (audioContext, audioBuffer) => {
  if (!audioBuffer || !audioContext) return null;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  const sampleSource = audioContext.createBufferSource();
  sampleSource.buffer = audioBuffer;
  sampleSource.connect(audioContext.destination);
  sampleSource.start();

  return sampleSource;
};

export const useAudioContext = () => {
  const [audioContext, setAudioContext] = React.useState(null);

  React.useEffect(() => {
    if (
      Object.prototype.hasOwnProperty.call(window, 'webkitAudioContext') &&
      !Object.prototype.hasOwnProperty.call(window, 'AudioContext')
    ) {
      window.AudioContext = window.webkitAudioContext;
    }
    const audioContext = new AudioContext();
    setAudioContext(audioContext);
    return () => {
      audioContext.close();
    };
  }, []);

  return audioContext;
}

export const useAudioElement = (filepath, loop=true) => {
  const [audioElement, setAudioElement] = React.useState(null);

  React.useEffect(() => {
    const audioElement = new Audio(filepath);
    audioElement.loop = loop;
    const volume = audioElement.volume;
    audioElement.volume = 0;
    audioElement.play().catch(() => {
      /*no problem here*/
    });
    audioElement.pause();
    audioElement.volume = volume;
    setAudioElement(audioElement);
    return () => {
      audioElement.pause();
    };
  }, [filepath, loop]);

  return audioElement;
}

