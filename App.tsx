import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useStorage } from "./src/hooks/useStorage";
import { useFeedback } from "./src/hooks/useFeedback";
import { ConfirmDialog } from "./src/components/ConfirmDialog";
import { SettingsPanel } from "./src/components/SettingsPanel";
import {
  VIBRATION_PATTERNS,
  SOUND_PATTERNS,
  KEY_MAPPINGS,
} from "./src/constants";

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

  // キーボードイベントの処理
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 設定パネルが開いているときはキー入力を無視
      if (isSettingsOpen || isConfirmOpen) return;

      if (KEY_MAPPINGS.INCREMENT.includes(e.code)) {
        increment();
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* カウンター表示 */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{count}</Text>
      </View>

      {/* 操作ボタン */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={decrement}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={increment}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* リセットボタン */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetClick}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  counterContainer: {
    marginBottom: 40,
  },
  counterText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 32,
    color: "#fff",
  },
  resetButton: {
    position: "absolute",
    bottom: 40,
    left: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  resetButtonText: {
    fontSize: 16,
    color: "rgb(239, 68, 68)",
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
  },
  settingsButtonText: {
    fontSize: 24,
  },
});
