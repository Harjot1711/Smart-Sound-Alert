import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Volume2, TriangleAlert as AlertTriangle, Chrome as Home, Baby, Smartphone, Moon, Sun, Palette, Monitor, Settings as SettingsIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const {
    enabledSounds,
    alertSettings,
    toggleSoundEnabled,
    toggleAlertSetting,
  } = useSoundAlert();

  const { colors, isDark } = useTheme();

  const soundAlerts = [
    {
      id: 'fire' as const,
      title: 'Fire Alarm Detection',
      subtitle: 'Detects smoke alarm beeps and fire safety sounds',
      icon: <AlertTriangle size={24} color={colors.error} />,
      enabled: enabledSounds.fire,
      color: colors.error,
    },
    {
      id: 'doorbell' as const,
      title: 'Doorbell Detection',
      subtitle: 'Alerts you when someone rings your doorbell',
      icon: <Home size={24} color={colors.primary} />,
      enabled: enabledSounds.doorbell,
      color: colors.primary,
    },
    {
      id: 'baby' as const,
      title: 'Baby Crying Detection',
      subtitle: 'Notifies you when a baby or infant is crying',
      icon: <Baby size={24} color={colors.warning} />,
      enabled: enabledSounds.baby,
      color: colors.warning,
    },
  ];

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <SettingsIcon size={32} color={colors.primary} />
              <Text style={styles.title}>Settings</Text>
            </View>
            <Text style={styles.subtitle}>
              Customize your sound detection preferences
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound Detection</Text>
            <View style={styles.card}>
              {soundAlerts.map((alert, index) => (
                <View key={alert.id} style={[
                  styles.settingRow,
                  index === soundAlerts.length - 1 && styles.lastSettingRow
                ]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: alert.color + '15' }]}>
                      {alert.icon}
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{alert.title}</Text>
                      <Text style={styles.settingSubtitle}>{alert.subtitle}</Text>
                    </View>
                  </View>
                  <Switch
                    value={alert.enabled}
                    onValueChange={() => toggleSoundEnabled(alert.id)}
                    trackColor={{ false: colors.border, true: alert.color + '80' }}
                    thumbColor={alert.enabled ? '#FFFFFF' : colors.surface}
                    accessible={true}
                    accessibilityLabel={`Toggle ${alert.title}`}
                    accessibilityRole="switch"
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alert Preferences</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                    <Smartphone size={24} color={colors.accent} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Vibration Alerts</Text>
                    <Text style={styles.settingSubtitle}>Vibrate device when sound is detected</Text>
                  </View>
                </View>
                <Switch
                  value={alertSettings.vibration}
                  onValueChange={() => toggleAlertSetting('vibration')}
                  trackColor={{ false: colors.border, true: colors.accent + '80' }}
                  thumbColor={alertSettings.vibration ? '#FFFFFF' : colors.surface}
                  accessible={true}
                  accessibilityLabel="Toggle vibration alerts"
                  accessibilityRole="switch"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.success + '15' }]}>
                    <Palette size={24} color={colors.success} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Visual Flash Alerts</Text>
                    <Text style={styles.settingSubtitle}>Flash screen colors when alerts appear</Text>
                  </View>
                </View>
                <Switch
                  value={alertSettings.flashScreen}
                  onValueChange={() => toggleAlertSetting('flashScreen')}
                  trackColor={{ false: colors.border, true: colors.success + '80' }}
                  thumbColor={alertSettings.flashScreen ? '#FFFFFF' : colors.surface}
                  accessible={true}
                  accessibilityLabel="Toggle screen flashing alerts"
                  accessibilityRole="switch"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.warning + '15' }]}>
                    <Volume2 size={24} color={colors.warning} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Sound Notifications</Text>
                    <Text style={styles.settingSubtitle}>Play notification sound with alerts</Text>
                  </View>
                </View>
                <Switch
                  value={alertSettings.soundFeedback}
                  onValueChange={() => toggleAlertSetting('soundFeedback')}
                  trackColor={{ false: colors.border, true: colors.warning + '80' }}
                  thumbColor={alertSettings.soundFeedback ? '#FFFFFF' : colors.surface}
                  accessible={true}
                  accessibilityLabel="Toggle sound feedback"
                  accessibilityRole="switch"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.textSecondary + '15' }]}>
                    {isDark ? (
                      <Moon size={24} color={colors.textSecondary} />
                    ) : (
                      <Sun size={24} color={colors.textSecondary} />
                    )}
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Dark Mode</Text>
                    <Text style={styles.settingSubtitle}>Use dark theme for easier viewing</Text>
                  </View>
                </View>
                <Switch
                  value={alertSettings.darkMode}
                  onValueChange={() => toggleAlertSetting('darkMode')}
                  trackColor={{ false: colors.border, true: colors.textSecondary + '80' }}
                  thumbColor={alertSettings.darkMode ? '#FFFFFF' : colors.surface}
                  accessible={true}
                  accessibilityLabel="Toggle dark mode"
                  accessibilityRole="switch"
                />
              </View>

              <View style={[styles.settingRow, styles.lastSettingRow]}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '15' }]}>
                    <Monitor size={24} color={colors.secondary} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Demo Mode</Text>
                    <Text style={styles.settingSubtitle}>Enhanced testing with realistic alerts</Text>
                  </View>
                </View>
                <Switch
                  value={alertSettings.demoMode}
                  onValueChange={() => toggleAlertSetting('demoMode')}
                  trackColor={{ false: colors.border, true: colors.secondary + '80' }}
                  thumbColor={alertSettings.demoMode ? '#FFFFFF' : colors.surface}
                  accessible={true}
                  accessibilityLabel="Toggle demo mode"
                  accessibilityRole="switch"
                />
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>About Sound Guardian</Text>
              <Text style={styles.infoText}>
                Sound Guardian helps you stay aware of important sounds in your environment. 
                It uses advanced technology to detect fire alarms, doorbells, and baby cries, 
                then alerts you through visual, vibration, and sound notifications.
              </Text>
              <Text style={styles.infoText}>
                For best results, keep your device nearby with the microphone unobstructed. 
                The app works entirely on your device to protect your privacy.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastSettingRow: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
});