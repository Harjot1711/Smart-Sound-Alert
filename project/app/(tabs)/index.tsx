import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX, TriangleAlert as AlertTriangle, Chrome as Home, Baby, Mic, MicOff, Shield, Activity, Zap, Heart, Radio, TrendingUp, Target, CircleCheck as CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMicrophoneListener } from '@/hooks/useMicrophoneListener';
import AudioVisualizer from '@/components/AudioVisualizer';
import AlertModal from '@/components/AlertModal';

const { width, height } = Dimensions.get('window');

export default function ListenScreen() {
  const {
    isListening,
    setIsListening,
    enabledSounds,
    triggerAlert,
    currentAlert,
    alertSettings,
    alertHistory,
  } = useSoundAlert();

  const { colors, isDark } = useTheme();
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    hasPermission,
    error,
    audioLevel,
    isInitializing: micInitializing,
    requestPermission,
  } = useMicrophoneListener({
    isListening,
    onSoundDetected: (detection) => {
      triggerAlert(detection.type, detection.confidence);
    },
    enabledSounds,
  });

  const handleToggleListening = async () => {
    if (!isListening) {
      setIsInitializing(true);
      
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Microphone Permission Required',
            'Please allow microphone access to detect sounds. You can enable this in your browser settings.',
            [{ text: 'OK' }]
          );
          setIsInitializing(false);
          return;
        }
      }
      
      setTimeout(() => {
        setIsListening(true);
        setIsInitializing(false);
      }, 1000);
    } else {
      setIsListening(false);
    }
  };

  const simulateAlert = (type: 'fire' | 'doorbell' | 'baby') => {
    let confidence: number;
    
    if (alertSettings.demoMode) {
      confidence = Math.random() * 0.25 + 0.70;
    } else {
      switch (type) {
        case 'fire':
          confidence = 0.85 + Math.random() * 0.13;
          break;
        case 'doorbell':
          confidence = 0.78 + Math.random() * 0.17;
          break;
        case 'baby':
          confidence = 0.75 + Math.random() * 0.20;
          break;
        default:
          confidence = 0.8;
      }
    }
    
    triggerAlert(type, confidence);
  };

  const getEnabledSoundsCount = () => {
    return Object.values(enabledSounds).filter(Boolean).length;
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (isInitializing || micInitializing) return 'Setting up your sound protection system...';
    if (isListening) return `Actively protecting you by monitoring ${getEnabledSoundsCount()} important sounds`;
    return 'Tap the large button below to start your sound protection';
  };

  const getProtectionLevel = () => {
    if (!isListening) return 'Not Active';
    const count = getEnabledSoundsCount();
    if (count === 3) return 'Full Protection';
    if (count === 2) return 'Good Protection';
    if (count === 1) return 'Basic Protection';
    return 'No Protection';
  };

  const getProtectionColor = () => {
    if (!isListening) return colors.textMuted;
    const count = getEnabledSoundsCount();
    if (count === 3) return colors.success;
    if (count === 2) return colors.warning;
    if (count === 1) return colors.primary;
    return colors.textMuted;
  };

  const getRecentDetections = () => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return alertHistory.filter(alert => alert.timestamp >= last24Hours).length;
  };

  const getAverageConfidence = () => {
    if (alertHistory.length === 0) return 0;
    const sum = alertHistory.reduce((acc, alert) => acc + (alert.confidence || 0), 0);
    return Math.round((sum / alertHistory.length) * 100);
  };

  const styles = createStyles(colors, isDark);

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.content}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Clean Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Shield size={32} color={colors.primary} />
                <Text style={styles.title}>Sound Guardian</Text>
              </View>
              <Text style={styles.subtitle}>
                Your personal sound detection assistant for safety and peace of mind
              </Text>
            </View>

            {/* Status Dashboard */}
            <View style={styles.statusContainer}>
              <View style={styles.statusCard}>
                <Shield size={24} color={getProtectionColor()} />
                <Text style={styles.statusLabel}>Protection Status</Text>
                <Text style={[styles.statusValue, { 
                  color: getProtectionColor()
                }]}>
                  {getProtectionLevel()}
                </Text>
              </View>
              
              <View style={styles.statusCard}>
                <Radio size={24} color={audioLevel > 0.1 ? colors.success : colors.textMuted} />
                <Text style={styles.statusLabel}>Microphone</Text>
                <Text style={[styles.statusValue, {
                  color: audioLevel > 0.1 ? colors.success : colors.textSecondary
                }]}>
                  {audioLevel > 0.1 ? 'Active' : 'Quiet'}
                </Text>
              </View>
              
              <View style={styles.statusCard}>
                <CheckCircle size={24} color={getEnabledSoundsCount() > 0 ? colors.primary : colors.textMuted} />
                <Text style={styles.statusLabel}>Detectors</Text>
                <Text style={[styles.statusValue, {
                  color: getEnabledSoundsCount() > 0 ? colors.primary : colors.textSecondary
                }]}>
                  {getEnabledSoundsCount()} of 3
                </Text>
              </View>
            </View>

            {/* Main Control Area */}
            <View style={styles.mainContent}>
              <View style={styles.visualizerContainer}>
                <AudioVisualizer 
                  audioLevel={audioLevel} 
                  isListening={isListening}
                  size={160}
                />
                <TouchableOpacity
                  onPress={handleToggleListening}
                  style={[
                    styles.listenButton,
                    isListening && styles.listenButtonActive,
                    (isInitializing || micInitializing) && styles.listenButtonInitializing
                  ]}
                  disabled={isInitializing || micInitializing}
                  accessible={true}
                  accessibilityLabel={isListening ? "Stop sound protection" : "Start sound protection"}
                  accessibilityRole="button"
                >
                  {(isInitializing || micInitializing) ? (
                    <Activity size={48} color="#FFFFFF" />
                  ) : isListening ? (
                    <Mic size={48} color="#FFFFFF" />
                  ) : (
                    <MicOff size={48} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.statusText}>
                {getStatusMessage()}
              </Text>

              {isListening && (
                <View style={styles.listeningIndicator}>
                  <View style={styles.indicatorDot} />
                  <Text style={styles.indicatorText}>
                    Sound protection is active and working
                  </Text>
                </View>
              )}

              {Platform.OS === 'web' && !hasPermission && !isListening && (
                <View style={styles.permissionNotice}>
                  <Text style={styles.permissionText}>
                    🎤 Microphone access needed
                  </Text>
                  <Text style={styles.permissionSubtext}>
                    Click "Allow" when your browser asks for microphone permission
                  </Text>
                </View>
              )}
            </View>

            {/* Test Section */}
            <View style={styles.testSection}>
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>Test Your Alerts</Text>
                <Text style={styles.testSubtitle}>
                  Try these buttons to see how alerts work and make sure everything is set up correctly
                </Text>
              </View>
              
              <View style={styles.testButtons}>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: colors.error }]}
                  onPress={() => simulateAlert('fire')}
                  accessible={true}
                  accessibilityLabel="Test fire alarm alert"
                  accessibilityRole="button"
                >
                  <AlertTriangle size={28} color="#FFFFFF" />
                  <Text style={styles.testButtonText}>Fire Alarm</Text>
                  <Text style={styles.testButtonSubtext}>Emergency</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: colors.primary }]}
                  onPress={() => simulateAlert('doorbell')}
                  accessible={true}
                  accessibilityLabel="Test doorbell alert"
                  accessibilityRole="button"
                >
                  <Home size={28} color="#FFFFFF" />
                  <Text style={styles.testButtonText}>Doorbell</Text>
                  <Text style={styles.testButtonSubtext}>Visitor</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: colors.warning }]}
                  onPress={() => simulateAlert('baby')}
                  accessible={true}
                  accessibilityLabel="Test baby crying alert"
                  accessibilityRole="button"
                >
                  <Baby size={28} color="#FFFFFF" />
                  <Text style={styles.testButtonText}>Baby Cry</Text>
                  <Text style={styles.testButtonSubtext}>Infant</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Performance Summary */}
            {alertHistory.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Your Protection Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <Target size={20} color={colors.success} />
                    <Text style={styles.summaryValue}>{getAverageConfidence()}%</Text>
                    <Text style={styles.summaryLabel}>Accuracy</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <TrendingUp size={20} color={colors.primary} />
                    <Text style={styles.summaryValue}>{getRecentDetections()}</Text>
                    <Text style={styles.summaryLabel}>Today's Alerts</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
      
      <AlertModal />
    </>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  visualizerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  listenButton: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: colors.background,
  },
  listenButtonActive: {
    backgroundColor: colors.success,
  },
  listenButtonInitializing: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 28,
    maxWidth: 340,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.success + '40',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  indicatorText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  permissionNotice: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.warning + '40',
    maxWidth: 340,
  },
  permissionText: {
    color: colors.warning,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  permissionSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  testSection: {
    marginBottom: 32,
  },
  testHeader: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  testTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  testSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  testButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  testButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 100,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});