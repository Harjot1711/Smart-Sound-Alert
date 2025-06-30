import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Modal, Platform,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, interpolateColor, Easing, withSpring, withDelay,
} from "react-native-reanimated";
import {
  TriangleAlert as AlertTriangle, Chrome as Home, Baby, X, Clock,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import { useTheme } from "@/contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function AlertModal() {
  const { currentAlert, dismissAlert, alertSettings } = useSoundAlert();
  const { colors } = useTheme();

  const flash = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const slide = useSharedValue(height);
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: alertSettings.flashScreen
      ? interpolateColor(flash.value, [0, 1], [getClr(), "#FFF"])
      : getClr(),
  }));
  const slideStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slide.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.3 }));

  useEffect(() => {
    if (!currentAlert) {
      reset();
      return;
    }
    slide.value = withSpring(0, { damping: 20, stiffness: 300 });
    scale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 200 }));
    pulse.value = withRepeat(withSequence(withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })), -1, false);
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0.3, { duration: 1200 })), -1, false);
    if (alertSettings.flashScreen) flash.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })), -1, false);
    if (alertSettings.vibration && Platform.OS === "web" && "vibrate" in navigator) navigator.vibrate(currentAlert.type === "fire" ? [300, 150, 300, 150, 300] : [200, 100, 200]);
    if (currentAlert.type !== "fire") {
      const t = setTimeout(dismissAlert, 20000);
      return () => clearTimeout(t);
    }
  }, [currentAlert, alertSettings.flashScreen, alertSettings.vibration]);

  function reset() {
    flash.value = 0;
    scale.value = 0.8;
    slide.value = height;
    pulse.value = 1;
    glow.value = 0;
  }
  function getClr() {
    const t = currentAlert?.type;
    return t === "fire" ? colors.error : t === "doorbell" ? colors.primary : t === "baby" ? colors.warning : colors.textMuted;
  }
  const Icon = () =>
    currentAlert?.type === "fire" ? <AlertTriangle size={64} color="#FFF" /> : currentAlert?.type === "doorbell" ? <Home size={64} color="#FFF" /> : currentAlert?.type === "baby" ? <Baby size={64} color="#FFF" /> : <AlertTriangle size={64} color="#FFF" />;

  if (!currentAlert) return null;

  return (
    <Modal visible animationType="none" presentationStyle="fullScreen" statusBarTranslucent>
      <Animated.View style={[styles.container, bgStyle, slideStyle]}>
        <SafeAreaView style={styles.content}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={[styles.card, cardStyle]}>
            <TouchableOpacity style={styles.close} onPress={dismissAlert}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            <Animated.View style={[styles.iconWrap, iconStyle]}>
              <Icon />
            </Animated.View>
            <Text style={styles.title}>{currentAlert.type === "fire" ? "Fire Alarm Detected" : currentAlert.type === "doorbell" ? "Doorbell Detected" : currentAlert.type === "baby" ? "Baby Crying Detected" : "Sound Detected"}</Text>
            <Text style={styles.msg}>{currentAlert.type === "fire" ? "A fire alarm sound has been detected. If this is a real emergency, please evacuate immediately." : currentAlert.type === "doorbell" ? "Someone is at your door. A doorbell sound has been detected." : currentAlert.type === "baby" ? "A baby crying sound has been detected. An infant may need attention." : "An important sound has been detected in your environment."}</Text>
            <View style={styles.stamp}>
              <Clock size={16} color="rgba(255,255,255,.9)" />
              <Text style={styles.time}>Detected at {currentAlert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
            </View>
            {currentAlert.confidence && (
              <View style={styles.confBox}>
                <Text style={styles.confLbl}>Detection Confidence: {Math.round(currentAlert.confidence * 100)}%</Text>
                <View style={styles.confBar}>
                  <View style={[styles.confFill, { width: `${Math.round(currentAlert.confidence * 100)}%` }]} />
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.dismiss} onPress={dismissAlert}>
              <Text style={styles.dismissTxt}>Dismiss Alert</Text>
            </TouchableOpacity>
            {currentAlert.type !== "fire" && <Text style={styles.auto}>This alert will automatically close in 20 seconds</Text>}
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  glow: { position: "absolute", width: width * 1.5, height: height * 1.5, borderRadius: width * 0.75, backgroundColor: "rgba(255,255,255,.1)", top: -height * 0.25, left: -width * 0.25 },
  card: { alignItems: "center", padding: 32, maxWidth: 400, width: "100%", backgroundColor: "rgba(255,255,255,.15)", borderRadius: 24, borderWidth: 2, borderColor: "rgba(255,255,255,.3)", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 12 },
  close: { position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,.2)", justifyContent: "center", alignItems: "center" },
  iconWrap: { padding: 24, borderRadius: 40, backgroundColor: "rgba(255,255,255,.2)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#FFF", textAlign: "center", marginBottom: 16 },
  msg: { fontSize: 18, color: "#FFF", textAlign: "center", marginBottom: 24, lineHeight: 26, opacity: 0.95, fontWeight: "500" },
  stamp: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 8 },
  time: { fontSize: 16, color: "#FFF", opacity: 0.9, fontWeight: "600" },
  confBox: { width: "100%", alignItems: "center", marginBottom: 24 },
  confLbl: { fontSize: 16, color: "#FFF", marginBottom: 8, opacity: 0.95, fontWeight: "600" },
  confBar: { width: "80%", height: 8, backgroundColor: "rgba(255,255,255,.3)", borderRadius: 4, overflow: "hidden" },
  confFill: { height: "100%", backgroundColor: "#FFF", borderRadius: 4 },
  dismiss: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24, borderWidth: 2, borderColor: "rgba(255,255,255,.8)", backgroundColor: "rgba(255,255,255,.1)", marginBottom: 16 },
  dismissTxt: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  auto: { fontSize: 14, color: "#FFF", textAlign: "center", opacity: 0.8, fontWeight: "500" },
});
