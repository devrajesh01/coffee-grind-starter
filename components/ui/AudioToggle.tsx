'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioController {
  toggle: () => boolean;
  playGrind: () => void;
  playPour: () => void;
  playChime: () => void;
}

export let audioController: AudioController | null = null;

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Ambient warm tone (gentle brown noise for cozy atmosphere)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 2.8; // warm gain
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Low pass filter to create soft warm air hum
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(0);
    noiseNodeRef.current = whiteNoise;
    ambientGainRef.current = gain;

    return ctx;
  };

  const toggleSound = () => {
    const ctx = initAudio();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (ambientGainRef.current) {
      const now = ctx.currentTime;
      ambientGainRef.current.gain.cancelScheduledValues(now);
      ambientGainRef.current.gain.linearRampToValueAtTime(nextState ? 0.045 : 0.0001, now + 0.6);
    }

    return nextState;
  };

  useEffect(() => {
    audioController = {
      toggle: toggleSound,
      playGrind: () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !isPlaying || ctx.state !== 'running') return;
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(95, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.35);
          g.gain.setValueAtTime(0.03, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.36);
        } catch {
          // Ignore audio errors
        }
      },
      playPour: () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !isPlaying || ctx.state !== 'running') return;
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.28);
          g.gain.setValueAtTime(0.02, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.28);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.29);
        } catch {
          // Ignore audio errors
        }
      },
      playChime: () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !isPlaying || ctx.state !== 'running') return;
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
          g.gain.setValueAtTime(0.04, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.81);
        } catch {
          // Ignore audio errors
        }
      }
    };

    return () => {
      audioController = null;
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isPlaying]);

  return (
    <button
      onClick={toggleSound}
      className="audio-pill-toggle"
      title={isPlaying ? 'Mute ambient sound' : 'Turn on coffee ambient sound'}
      aria-label="Toggle ambient audio"
    >
      {isPlaying ? (
        <>
          <Volume2 size={15} className="audio-icon audio-icon--active" />
          <span className="audio-bars">
            <span className="bar bar-1"></span>
            <span className="bar bar-2"></span>
            <span className="bar bar-3"></span>
          </span>
          <span className="audio-text">SOUND ON</span>
        </>
      ) : (
        <>
          <VolumeX size={15} className="audio-icon" />
          <span className="audio-text">SOUND OFF</span>
        </>
      )}
    </button>
  );
}

