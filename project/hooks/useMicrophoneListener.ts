import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

export interface SoundDetection {
  type: 'fire' | 'doorbell' | 'baby';
  confidence: number;
  timestamp: Date;
  frequency?: number;
  amplitude?: number;
}

interface UseMicrophoneListenerProps {
  isListening: boolean;
  onSoundDetected: (detection: SoundDetection) => void;
  enabledSounds: {
    fire: boolean;
    doorbell: boolean;
    baby: boolean;
  };
}

export function useMicrophoneListener({
  isListening,
  onSoundDetected,
  enabledSounds,
}: UseMicrophoneListenerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<{ [key: string]: number }>({});
  const smoothedLevelRef = useRef(0);
  const frequencyHistoryRef = useRef<number[][]>([]);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'web') {
      setError('Microphone access is only available on web platform');
      return false;
    }

    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        }
      });
      
      mediaStreamRef.current = stream;
      setHasPermission(true);
      setError(null);
      setIsInitializing(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('🎤 Microphone access denied. Please allow microphone permissions in your browser settings and refresh the page.');
      } else if (errorMessage.includes('NotFound') || errorMessage.includes('NotFoundError')) {
        setError('🔍 No microphone detected. Please connect a microphone and try again.');
      } else if (errorMessage.includes('NotSupported') || errorMessage.includes('NotSupportedError')) {
        setError('⚠️ Your browser doesn\'t support microphone access. Please use Chrome, Firefox, or Safari.');
      } else {
        setError('❌ Failed to access microphone. Please check your browser settings and try again.');
      }
      setHasPermission(false);
      setIsInitializing(false);
      return false;
    }
  }, []);

  const initializeAudioContext = useCallback(() => {
    if (!mediaStreamRef.current) return false;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
      
      // Enhanced analyzer settings for better detection
      analyser.fftSize = 16384; // Very high resolution for precise frequency detection
      analyser.smoothingTimeConstant = 0.1; // Less smoothing for more responsive detection
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      return true;
    } catch (err) {
      setError('🔧 Failed to initialize audio processing. Please refresh the page and try again.');
      return false;
    }
  }, []);

  // Enhanced fire alarm detection with pattern recognition
  const detectFireAlarm = useCallback((frequencyData: Uint8Array, sampleRate: number) => {
    if (!enabledSounds.fire) return null;

    const bufferLength = frequencyData.length;
    const nyquist = sampleRate / 2;
    
    // Fire alarms: 3100Hz fundamental with 6200Hz harmonic
    const targetFreq = 3100;
    const harmonicFreq = 6200;
    const tolerance = 150;
    
    const getFrequencyBin = (freq: number) => Math.round(freq * bufferLength / nyquist);
    
    const targetBin = getFrequencyBin(targetFreq);
    const harmonicBin = getFrequencyBin(harmonicFreq);
    
    // Analyze fundamental frequency with wider range
    let fundamentalPeak = 0;
    let fundamentalAvg = 0;
    let fundamentalCount = 0;
    
    for (let i = Math.max(0, targetBin - 8); i <= Math.min(bufferLength - 1, targetBin + 8); i++) {
      fundamentalPeak = Math.max(fundamentalPeak, frequencyData[i]);
      fundamentalAvg += frequencyData[i];
      fundamentalCount++;
    }
    fundamentalAvg = fundamentalCount > 0 ? fundamentalAvg / fundamentalCount : 0;
    
    // Analyze harmonic frequency
    let harmonicPeak = 0;
    let harmonicAvg = 0;
    let harmonicCount = 0;
    
    for (let i = Math.max(0, harmonicBin - 6); i <= Math.min(bufferLength - 1, harmonicBin + 6); i++) {
      harmonicPeak = Math.max(harmonicPeak, frequencyData[i]);
      harmonicAvg += frequencyData[i];
      harmonicCount++;
    }
    harmonicAvg = harmonicCount > 0 ? harmonicAvg / harmonicCount : 0;
    
    // Enhanced detection criteria
    const fundamentalThreshold = 120;
    const harmonicThreshold = 60;
    const avgThreshold = 40;
    
    if (fundamentalPeak > fundamentalThreshold && 
        fundamentalAvg > avgThreshold &&
        harmonicPeak > harmonicThreshold) {
      
      // Calculate confidence based on signal strength and pattern match
      const fundamentalScore = Math.min(fundamentalPeak / 200, 1);
      const harmonicScore = Math.min(harmonicPeak / 120, 1);
      const avgScore = Math.min(fundamentalAvg / 80, 1);
      
      const confidence = (fundamentalScore * 0.5 + harmonicScore * 0.3 + avgScore * 0.2);
      
      return { 
        type: 'fire' as const, 
        confidence: Math.min(confidence, 0.98),
        frequency: targetFreq,
        amplitude: fundamentalPeak
      };
    }
    
    return null;
  }, [enabledSounds.fire]);

  // Enhanced doorbell detection with pattern analysis
  const detectDoorbell = useCallback((frequencyData: Uint8Array, sampleRate: number) => {
    if (!enabledSounds.doorbell) return null;

    const bufferLength = frequencyData.length;
    const nyquist = sampleRate / 2;
    
    // Doorbell frequency ranges with typical patterns
    const ranges = [
      { min: 350, max: 550, weight: 0.3 },   // Low fundamental
      { min: 700, max: 1000, weight: 0.4 },  // Mid range (most common)
      { min: 1200, max: 1600, weight: 0.3 }  // High harmonic
    ];
    
    let totalScore = 0;
    let weightedScore = 0;
    let activeRanges = 0;
    let dominantFreq = 0;
    let maxAmplitude = 0;
    
    ranges.forEach(range => {
      const minBin = Math.floor(range.min * bufferLength / nyquist);
      const maxBin = Math.ceil(range.max * bufferLength / nyquist);
      
      let rangePeak = 0;
      let rangeAvg = 0;
      let count = 0;
      let peakFreq = 0;
      
      for (let i = minBin; i <= maxBin && i < bufferLength; i++) {
        const amplitude = frequencyData[i];
        if (amplitude > rangePeak) {
          rangePeak = amplitude;
          peakFreq = i * nyquist / bufferLength;
        }
        rangeAvg += amplitude;
        count++;
      }
      
      if (count > 0) {
        rangeAvg /= count;
        
        // Enhanced thresholds for better detection
        if (rangePeak > 65 && rangeAvg > 25) {
          totalScore += rangePeak + rangeAvg;
          weightedScore += (rangePeak + rangeAvg) * range.weight;
          activeRanges++;
          
          if (rangePeak > maxAmplitude) {
            maxAmplitude = rangePeak;
            dominantFreq = peakFreq;
          }
        }
      }
    });
    
    // Doorbell detection: activity in multiple ranges with good signal strength
    if (activeRanges >= 2 && weightedScore > 180) {
      const confidence = Math.min(weightedScore / 350, 0.95);
      return { 
        type: 'doorbell' as const, 
        confidence,
        frequency: dominantFreq,
        amplitude: maxAmplitude
      };
    }
    
    return null;
  }, [enabledSounds.doorbell]);

  // Enhanced baby crying detection with harmonic analysis
  const detectBabyCrying = useCallback((frequencyData: Uint8Array, sampleRate: number) => {
    if (!enabledSounds.baby) return null;

    const bufferLength = frequencyData.length;
    const nyquist = sampleRate / 2;
    
    // Baby crying: complex harmonic structure with fundamental 250-600Hz
    const fundamentalRange = { min: 250, max: 600 };
    const harmonic1Range = { min: 800, max: 1400 };
    const harmonic2Range = { min: 1600, max: 2800 };
    const harmonic3Range = { min: 3000, max: 4500 };
    
    const analyzeRange = (range: { min: number; max: number }) => {
      const minBin = Math.floor(range.min * bufferLength / nyquist);
      const maxBin = Math.ceil(range.max * bufferLength / nyquist);
      
      let peak = 0;
      let avg = 0;
      let count = 0;
      let peakFreq = 0;
      
      for (let i = minBin; i <= maxBin && i < bufferLength; i++) {
        const amplitude = frequencyData[i];
        if (amplitude > peak) {
          peak = amplitude;
          peakFreq = i * nyquist / bufferLength;
        }
        avg += amplitude;
        count++;
      }
      
      return { 
        peak, 
        avg: count > 0 ? avg / count : 0,
        frequency: peakFreq
      };
    };
    
    const fundamental = analyzeRange(fundamentalRange);
    const harmonic1 = analyzeRange(harmonic1Range);
    const harmonic2 = analyzeRange(harmonic2Range);
    const harmonic3 = analyzeRange(harmonic3Range);
    
    // Enhanced baby crying detection with harmonic structure analysis
    const fundamentalThreshold = 80;
    const harmonicThreshold = 45;
    const avgThreshold = 35;
    
    if (fundamental.peak > fundamentalThreshold && 
        fundamental.avg > avgThreshold &&
        (harmonic1.peak > harmonicThreshold || 
         harmonic2.peak > harmonicThreshold ||
         harmonic3.peak > harmonicThreshold * 0.8)) {
      
      // Calculate confidence based on harmonic richness
      const fundamentalScore = Math.min(fundamental.peak / 150, 1);
      const harmonicScore = Math.min(
        (harmonic1.peak + harmonic2.peak + harmonic3.peak) / 200, 1
      );
      const avgScore = Math.min(fundamental.avg / 70, 1);
      
      const confidence = (fundamentalScore * 0.4 + harmonicScore * 0.4 + avgScore * 0.2);
      
      return { 
        type: 'baby' as const, 
        confidence: Math.min(confidence, 0.92),
        frequency: fundamental.frequency,
        amplitude: fundamental.peak
      };
    }
    
    return null;
  }, [enabledSounds.baby]);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(timeData);
    
    // Enhanced audio level calculation with RMS
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const sample = (timeData[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / timeData.length);
    
    // Apply exponential smoothing for better visualization
    const targetLevel = Math.min(rms * 5, 1);
    smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * 0.25;
    setAudioLevel(smoothedLevelRef.current);
    
    // Store frequency history for pattern analysis
    frequencyHistoryRef.current.push(Array.from(frequencyData));
    if (frequencyHistoryRef.current.length > 10) {
      frequencyHistoryRef.current.shift();
    }
    
    const sampleRate = audioContextRef.current.sampleRate;
    const now = Date.now();
    
    // Run enhanced detection algorithms
    const detections = [
      detectFireAlarm(frequencyData, sampleRate),
      detectDoorbell(frequencyData, sampleRate),
      detectBabyCrying(frequencyData, sampleRate),
    ].filter(Boolean);
    
    // Process detections with intelligent cooldown
    detections.forEach((detection) => {
      if (!detection) return;
      
      const lastDetection = lastDetectionRef.current[detection.type] || 0;
      const cooldownPeriod = detection.type === 'fire' ? 3000 : 8000; // 3s for fire, 8s for others
      
      // Enhanced confidence threshold based on type
      const confidenceThreshold = detection.type === 'fire' ? 0.75 : 0.7;
      
      if (now - lastDetection > cooldownPeriod && detection.confidence > confidenceThreshold) {
        lastDetectionRef.current[detection.type] = now;
        onSoundDetected({
          type: detection.type,
          confidence: detection.confidence,
          timestamp: new Date(),
          frequency: detection.frequency,
          amplitude: detection.amplitude,
        });
      }
    });
    
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isListening, onSoundDetected, detectFireAlarm, detectDoorbell, detectBabyCrying]);

  const startListening = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    if (!initializeAudioContext()) {
      return false;
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Reset detection history
    lastDetectionRef.current = {};
    frequencyHistoryRef.current = [];

    analyzeAudio();
    return true;
  }, [hasPermission, requestPermission, initializeAudioContext, analyzeAudio]);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    analyserRef.current = null;
    smoothedLevelRef.current = 0;
    setAudioLevel(0);
    setHasPermission(false);
  }, []);

  useEffect(() => {
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }
    
    return () => {
      stopListening();
    };
  }, [isListening, startListening, stopListening]);

  return {
    hasPermission,
    error,
    audioLevel,
    isInitializing,
    requestPermission,
  };
}