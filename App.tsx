import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useStorage } from "./src/hooks/useStorage";
import { useFeedback } from "./src/hooks/useFeedback";
import { ConfirmDialog } from "./src/components/ConfirmDialog";
import { SettingsPanel } from "./src/components/SettingsPanel";
import {
  VIBRATION_PATTERNS,
  SOUND_PATTERNS,
  KEY_MAPPINGS,
} from "./src/constants";

const { width, height } = Dimensions.get("window");

export default function App() {
  const { count, prevCount, increment, decrement, reset } = useStorage();
  const {
    vibrationEnabled,
    soundEnabled,
    handleVibration,
    handleSound,
    updateSettings,
  } = useFeedback();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scale] = useState(new Animated.Value(1));

  // キーボードイベントの処理
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 設定パネルが開いているときはキー入力を無視
      if (isSettingsOpen || isConfirmOpen) return;

      if (KEY_MAPPINGS.INCREMENT.includes(e.code)) {
        increment();
        animatePress();
      } else if (KEY_MAPPINGS.DECREMENT.includes(e.code)) {
        decrement();
      } else if (KEY_MAPPINGS.RESET.includes(e.code)) {
        handleResetClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [increment, decrement, isSettingsOpen, isConfirmOpen]);

  // カウントの変更に応じたフィードバック
  useEffect(() => {
    if (count === prevCount) return;

    const isIncrement = count > prevCount;
    const pattern = isIncrement
      ? VIBRATION_PATTERNS.COUNT_UP
      : VIBRATION_PATTERNS.COUNT_DOWN;
    const soundPattern = isIncrement
      ? SOUND_PATTERNS.COUNT_UP
      : SOUND_PATTERNS.COUNT_DOWN;

    handleVibration(pattern);
    handleSound(soundPattern);
  }, [count, prevCount, handleVibration, handleSound]);

  const animatePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  // リセットボタンのクリック処理
  const handleResetClick = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  // リセット確認時の処理
  const handleResetConfirm = useCallback(() => {
    reset();
    handleVibration(VIBRATION_PATTERNS.RESET);
    handleSound(SOUND_PATTERNS.RESET);
    setIsConfirmOpen(false);
  }, [reset, handleVibration, handleSound]);

  const handleMainPress = useCallback(() => {
    if (!isSettingsOpen && !isConfirmOpen) {
      increment();
      animatePress();
    }
  }, [increment, animatePress, isSettingsOpen, isConfirmOpen]);

  return (
    <TouchableWithoutFeedback onPress={handleMainPress}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#4338ca", "#3b82f6"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* メインエリア */}
        <Animated.View style={[styles.mainContent, { transform: [{ scale }] }]}>
          <View style={styles.counterArea}>
            <Text style={styles.title}>Counter</Text>
            <Animated.Text
              style={[
                styles.counterText,
                count > prevCount
                  ? styles.incrementText
                  : count < prevCount
                  ? styles.decrementText
                  : null,
              ]}
            >
              {count}
            </Animated.Text>
            <Text style={styles.helpText}>タップしてカウントアップ</Text>
            {Platform.OS === "web" && (
              <Text style={styles.shortcutText}>
                ショートカット: Space/↑ (上), ↓ (下), R (リセット)
              </Text>
            )}
          </View>
        </Animated.View>

        {/* 操作ボタン */}
        <View style={styles.buttonContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.button} onPress={decrement}>
            <Text style={styles.buttonText}>-1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleResetClick}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={increment}>
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
        </View>

        {/* 設定ボタン */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>

        {/* 確認ダイアログ */}
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onConfirm={handleResetConfirm}
          onCancel={() => setIsConfirmOpen(false)}
          message="カウンターをリセットしますか？"
        />

        {/* 設定パネル */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          vibrationEnabled={vibrationEnabled}
          soundEnabled={soundEnabled}
          onUpdateSettings={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* クレジット */}
        <Text style={styles.creditText}>
          Created by{" "}
          <Text
            style={styles.link}
            onPress={() =>
              Platform.OS === "web" &&
              window.open("https://github.com/hnishi/counter-expo", "_blank")
            }
          >
            hnishi
          </Text>
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 2,
    transform: [{ translateY: -height * 0.5 }],
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterArea: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(10px)",
    }),
    maxWidth: "90%",
    width: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  counterText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  incrementText: {
    color: "#4ade80",
  },
  decrementText: {
    color: "#f87171",
  },
  helpText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  shortcutText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 100,
    alignItems: "center",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(10px)",
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  settingsButton: {
    position: "absolute",
    top: 40,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(10px)",
    }),
  },
  settingsButtonText: {
    fontSize: 24,
  },
  creditText: {
    position: "absolute",
    bottom: 16,
    left: 16,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
  },
  link: {
    textDecorationLine: "underline",
  },
});
