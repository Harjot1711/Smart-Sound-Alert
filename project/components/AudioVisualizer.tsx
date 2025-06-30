import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface AudioVisualizerProps {
  audioLevel: number;
  isListening: boolean;
  size?: number;
}

export default function AudioVisualizer({ 
  audioLevel, 
  isListening, 
  size = 160 
}: AudioVisualizerProps) {
  const { colors, isDark } = useTheme();
  
  // Simplified animated values
  const pulseScale = useSharedValue(1);
  const wave1Scale = useSharedValue(0);
  const wave2Scale = useSharedValue(0);
  const wave3Scale = useSharedValue(0);
  const wave1Opacity = useSharedValue(0);
  const wave2Opacity = useSharedValue(0);
  const wave3Opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const breatheScale = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      // Gentle pulse based on audio level
      pulseScale.value = withSpring(1 + audioLevel * 0.2, {
        damping: 20,
        stiffness: 150,
      });

      // Subtle breathing animation
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Slow rotation
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 20000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Gentle ripple waves
      const createWaveAnimation = (
        scaleValue: Animated.SharedValue<number>,
        opacityValue: Animated.SharedValue<number>,
        delay: number
      ) => {
        const animate = () => {
          scaleValue.value = 0;
          opacityValue.value = 0.6;
          
          scaleValue.value = withTiming(2.5, {
            duration: 4000,
            easing: Easing.out(Easing.quad),
          });
          
          opacityValue.value = withSequence(
            withTiming(0.4, { duration: 500 }),
            withTiming(0, { duration: 3500, easing: Easing.out(Easing.quad) })
          );
        };

        setTimeout(() => {
          animate();
          setInterval(animate, 4000);
        }, delay);
      };

      createWaveAnimation(wave1Scale, wave1Opacity, 0);
      createWaveAnimation(wave2Scale, wave2Opacity, 1300);
      createWaveAnimation(wave3Scale, wave3Opacity, 2600);
    } else {
      // Reset animations
      pulseScale.value = withSpring(1, { damping: 20, stiffness: 300 });
      breatheScale.value = withTiming(1, { duration: 500 });
      wave1Scale.value = withTiming(0, { duration: 500 });
      wave2Scale.value = withTiming(0, { duration: 500 });
      wave3Scale.value = withTiming(0, { duration: 500 });
      wave1Opacity.value = withTiming(0, { duration: 500 });
      wave2Opacity.value = withTiming(0, { duration: 500 });
      wave3Opacity.value = withTiming(0, { duration: 500 });
      rotation.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) });
    }
  }, [isListening, audioLevel]);

  // Animated styles
  const centerCircleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value * breatheScale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave1Scale.value }],
    opacity: wave1Opacity.value,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave2Scale.value }],
    opacity: wave2Opacity.value,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave3Scale.value }],
    opacity: wave3Opacity.value,
  }));

  // Audio level bars
  const audioBarStyles = [...Array(8)].map((_, index) => {
    return useAnimatedStyle(() => {
      const barHeight = interpolate(
        audioLevel,
        [0, 1],
        [4, 20 + index * 2]
      );
      const opacity = interpolate(
        audioLevel,
        [0, 1],
        [0.3, audioLevel > index * 0.12 ? 1 : 0.4]
      );
      return {
        height: withSpring(barHeight, { damping: 15, stiffness: 200 }),
        opacity: withTiming(opacity, { duration: 150 }),
      };
    });
  });

  const styles = createStyles(colors, isDark, size);

  return (
    <View style={styles.container}>
      {/* Ripple waves */}
      <Animated.View style={[styles.wave, styles.wave1, wave1Style]} />
      <Animated.View style={[styles.wave, styles.wave2, wave2Style]} />
      <Animated.View style={[styles.wave, styles.wave3, wave3Style]} />
      
      {/* Center circle */}
      <Animated.View style={[styles.centerCircle, centerCircleStyle]}>
        <View style={styles.innerCircle}>
          <View style={styles.centerDot} />
        </View>
      </Animated.View>
      
      {/* Audio level bars */}
      {isListening && (
        <View style={styles.audioLevelContainer}>
          {audioBarStyles.map((animatedStyle, index) => (
            <Animated.View
              key={index}
              style={[styles.audioBar, animatedStyle]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean, size: number) => StyleSheet.create({
  container: {
    width: size * 2,
    height: size * 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    borderRadius: size / 2,
    borderWidth: 2,
  },
  wave1: {
    width: size,
    height: size,
    borderColor: colors.primary + '60',
  },
  wave2: {
    width: size * 1.2,
    height: size * 1.2,
    borderColor: colors.secondary + '50',
  },
  wave3: {
    width: size * 1.4,
    height: size * 1.4,
    borderColor: colors.accent + '40',
  },
  centerCircle: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  innerCircle: {
    width: size * 0.6,
    height: size * 0.6,
    borderRadius: (size * 0.6) / 2,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: size * 0.3,
    height: size * 0.3,
    borderRadius: (size * 0.3) / 2,
    backgroundColor: colors.primary,
  },
  audioLevelContainer: {
    position: 'absolute',
    bottom: -40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  audioBar: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});