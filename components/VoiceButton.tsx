
import React, { useState } from 'react';
import { speakText, decode, decodeAudioData } from '../services/geminiService';

interface VoiceButtonProps {
  text: string;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ text, disabled }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying || !text) return;
    setIsPlaying(true);
    try {
      const base64 = await speakText(text);
      if (!base64) throw new Error("No audio data");

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const decodedData = decode(base64);
      const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (err) {
      console.error("Audio error:", err);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={disabled || isPlaying}
      className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl shadow-md transition-all ${
        isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white'
      }`}
    >
      <i className={`fas ${isPlaying ? 'fa-spinner fa-spin' : 'fa-volume-up'}`}></i>
      {isPlaying ? 'Reading Aloud...' : 'Listen to this'}
    </button>
  );
};

export default VoiceButton;
