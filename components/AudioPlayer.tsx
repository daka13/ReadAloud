import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { AudioState, PLAYBACK_SPEEDS } from '../types';
import { ttsService } from '../services/ttsService';
import ProgressBar from './ProgressBar';

interface AudioPlayerProps {
  text: string;
  onComplete?: () => void;
  onPositionChange?: (position: number) => void;
  initialPosition?: number;
  voiceId?: string;
  language?: string;
}

export default function AudioPlayer({
  text,
  onComplete,
  onPositionChange,
  initialPosition = 0,
  voiceId = 'default',
  language = 'en-US',
}: AudioPlayerProps) {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: initialPosition,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
  });

  const [currentSpeedIndex, setCurrentSpeedIndex] = useState(2); // 1.0x
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Setup audio mode
    setupAudio();

    return () => {
      // Cleanup
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (audioState.isPlaying) {
        // Pause
        await ttsService.pause();
        isPlayingRef.current = false;
        setAudioState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: true,
        }));
      } else if (audioState.isPaused) {
        // Resume
        await ttsService.resume();
        isPlayingRef.current = true;
        setAudioState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
      } else {
        // Start playing
        setAudioState((prev) => ({ ...prev, isLoading: true }));

        await ttsService.speak(text, {
          language,
          rate: audioState.playbackRate,
          volume: audioState.volume,
          onDone: () => {
            isPlayingRef.current = false;
            setAudioState((prev) => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
              isLoading: false,
            }));
            onComplete?.();
          },
          onStopped: () => {
            isPlayingRef.current = false;
            setAudioState((prev) => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
              isLoading: false,
            }));
          },
          onError: (error) => {
            console.error('TTS Error:', error);
            isPlayingRef.current = false;
            setAudioState((prev) => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
              isLoading: false,
            }));
            Alert.alert('Error', 'Failed to play audio. Please try again.');
          },
        });

        isPlayingRef.current = true;
        setAudioState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error in play/pause:', error);
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        isLoading: false,
      }));
    }
  };

  const handleStop = async () => {
    try {
      await ttsService.stop();
      isPlayingRef.current = false;
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      }));
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  const handleSpeedChange = async () => {
    try {
      const nextIndex = (currentSpeedIndex + 1) % PLAYBACK_SPEEDS.length;
      const newSpeed = PLAYBACK_SPEEDS[nextIndex];

      setCurrentSpeedIndex(nextIndex);
      setAudioState((prev) => ({
        ...prev,
        playbackRate: newSpeed,
      }));

      // If currently playing, we need to restart with new speed
      if (audioState.isPlaying) {
        await handleStop();
        // Note: In production, you'd want to resume from current position
      }
    } catch (error) {
      console.error('Error changing speed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar
        currentTime={audioState.currentTime}
        duration={audioState.duration || 100}
        onSeek={(position) => {
          setAudioState((prev) => ({ ...prev, currentTime: position }));
          onPositionChange?.(position);
        }}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleStop}
          disabled={!audioState.isPlaying && !audioState.isPaused}
        >
          <Ionicons
            name="stop"
            size={32}
            color={audioState.isPlaying || audioState.isPaused ? '#007AFF' : '#ccc'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          disabled={audioState.isLoading}
        >
          {audioState.isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Ionicons
              name={audioState.isPlaying ? 'pause' : 'play'}
              size={48}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleSpeedChange}>
          <Text style={styles.speedText}>{audioState.playbackRate.toFixed(1)}x</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          {audioState.isPlaying ? 'Playing...' : audioState.isPaused ? 'Paused' : 'Ready'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});
