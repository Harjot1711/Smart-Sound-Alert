import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TriangleAlert as AlertTriangle, Chrome as Home, Baby, Clock, Trash2, Calendar, TrendingUp, Filter, ChartBar as BarChart3, Target } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HistoryScreen() {
  const { alertHistory, clearHistory } = useSoundAlert();
  const { colors, isDark } = useTheme();
  const [filterType, setFilterType] = useState<'all' | 'fire' | 'doorbell' | 'baby'>('all');

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return <AlertTriangle size={24} color="#EF4444" />;
      case 'doorbell':
        return <Home size={24} color="#3B82F6" />;
      case 'baby':
        return <Baby size={24} color="#F59E0B" />;
      default:
        return <AlertTriangle size={24} color="#6B7280" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'fire':
        return '#EF4444';
      case 'doorbell':
        return '#3B82F6';
      case 'baby':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekAlerts = alertHistory.filter(alert => alert.timestamp >= weekAgo);
    const thisMonthAlerts = alertHistory.filter(alert => alert.timestamp >= monthAgo);
    
    const avgConfidence = alertHistory.length > 0 
      ? alertHistory.reduce((sum, alert) => sum + (alert.confidence || 0), 0) / alertHistory.length
      : 0;
    
    return {
      week: {
        fire: thisWeekAlerts.filter(alert => alert.type === 'fire').length,
        doorbell: thisWeekAlerts.filter(alert => alert.type === 'doorbell').length,
        baby: thisWeekAlerts.filter(alert => alert.type === 'baby').length,
        total: thisWeekAlerts.length,
      },
      month: {
        total: thisMonthAlerts.length,
      },
      avgConfidence: avgConfidence * 100,
    };
  };

  const filteredHistory = filterType === 'all' 
    ? alertHistory 
    : alertHistory.filter(alert => alert.type === filterType);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Alert History',
      'Are you sure you want to delete all alert history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearHistory 
        }
      ]
    );
  };

  const stats = getStats();
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Alert History</Text>
          <Text style={styles.subtitle}>
            Track and analyze your sound detection patterns
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <TrendingUp size={22} color="#10B981" />
              <Text style={styles.statNumber}>{stats.week.total}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={22} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.month.total}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={22} color="#F59E0B" />
              <Text style={styles.statNumber}>{Math.round(stats.avgConfidence)}%</Text>
              <Text style={styles.statLabel}>Avg Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <BarChart3 size={22} color="#EC4899" />
              <Text style={styles.statNumber}>{alertHistory.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Filter and Actions */}
        <View style={styles.controlsSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {[
              { key: 'all', label: 'All', icon: Filter },
              { key: 'fire', label: 'Fire', icon: AlertTriangle },
              { key: 'doorbell', label: 'Doorbell', icon: Home },
              { key: 'baby', label: 'Baby', icon: Baby },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  filterType === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setFilterType(filter.key as any)}
              >
                <filter.icon 
                  size={18} 
                  color={filterType === filter.key ? '#FFFFFF' : colors.textSecondary} 
                />
                <Text style={[
                  styles.filterButtonText,
                  filterType === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {alertHistory.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearHistory}
              accessible={true}
              accessibilityLabel="Clear all alert history"
              accessibilityRole="button"
            >
              <Trash2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* History List */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={72} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {filterType === 'all' ? 'No Alerts Yet' : `No ${filterType} alerts`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filterType === 'all' 
                  ? 'Start listening to begin detecting environmental sounds'
                  : `No ${filterType} sounds have been detected yet`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={[
                    styles.iconContainer, 
                    { backgroundColor: `${getAlertColor(item.type)}20` }
                  ]}>
                    {getAlertIcon(item.type)}
                  </View>
                  
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.message}</Text>
                    <View style={styles.itemMeta}>
                      <View style={styles.itemTimestamp}>
                        <Calendar size={14} color={colors.textSecondary} />
                        <Text style={styles.timestampText}>
                          {formatDate(item.timestamp)}
                        </Text>
                      </View>
                      <Text style={styles.relativeTime}>
                        {formatTimestamp(item.timestamp)}
                      </Text>
                    </View>
                    {item.confidence && (
                      <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceText}>
                          {Math.round(item.confidence * 100)}% confidence
                        </Text>
                        <View style={styles.confidenceBar}>
                          <View 
                            style={[
                              styles.confidenceFill, 
                              { 
                                width: `${Math.round(item.confidence * 100)}%`,
                                backgroundColor: getAlertColor(item.type)
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: getAlertColor(item.type) }
                    ]} />
                    {item.dismissed && (
                      <Text style={styles.dismissedText}>Dismissed</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Weekly Breakdown */}
        {stats.week.total > 0 && (
          <View style={styles.weeklySection}>
            <Text style={styles.weeklyTitle}>This Week's Detection Summary</Text>
            <View style={styles.weeklyGrid}>
              <View style={styles.weeklyCard}>
                <AlertTriangle size={18} color="#EF4444" />
                <Text style={styles.weeklyNumber}>{stats.week.fire}</Text>
                <Text style={styles.weeklyLabel}>Fire Alarms</Text>
              </View>
              <View style={styles.weeklyCard}>
                <Home size={18} color="#3B82F6" />
                <Text style={styles.weeklyNumber}>{stats.week.doorbell}</Text>
                <Text style={styles.weeklyLabel}>Doorbells</Text>
              </View>
              <View style={styles.weeklyCard}>
                <Baby size={18} color="#F59E0B" />
                <Text style={styles.weeklyNumber}>{stats.week.baby}</Text>
                <Text style={styles.weeklyLabel}>Baby Cries</Text>
              </View>
            </View>
          </View>
        )}
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  filterContainer: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: colors.error,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.error,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
    fontWeight: '500',
  },
  historyList: {
    gap: 14,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  relativeTime: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  confidenceContainer: {
    marginTop: 6,
  },
  confidenceText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dismissedText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  weeklySection: {
    marginTop: 24,
    marginBottom: 20,
  },
  weeklyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  weeklyCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weeklyNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  weeklyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});