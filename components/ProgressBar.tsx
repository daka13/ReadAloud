import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek?: (position: number) => void;
}

export default function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const [seeking, setSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = seeking ? seekPosition : progress;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setSeeking(true);
      const { locationX } = evt.nativeEvent;
      const barWidth = Dimensions.get('window').width - 40; // Padding
      const newProgress = (locationX / barWidth) * 100;
      setSeekPosition(Math.max(0, Math.min(100, newProgress)));
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const barWidth = Dimensions.get('window').width - 40;
      const newProgress = (locationX / barWidth) * 100;
      setSeekPosition(Math.max(0, Math.min(100, newProgress)));
    },
    onPanResponderRelease: () => {
      setSeeking(false);
      const newTime = (seekPosition / 100) * duration;
      onSeek?.(newTime);
    },
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer} {...panResponder.panHandlers}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${displayProgress}%` }]} />
          <View
            style={[
              styles.progressThumb,
              { left: `${displayProgress}%` },
              seeking && styles.progressThumbActive,
            ]}
          />
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  progressContainer: {
    paddingVertical: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressThumbActive: {
    transform: [{ scale: 1.3 }],
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});
