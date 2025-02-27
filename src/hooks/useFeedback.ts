import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { STORAGE_KEYS } from "../constants";

type SoundPattern = {
  frequency: number;
  duration: number;
  repeat?: number;
};

export const useFeedback = () => {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 設定の読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [vibrationSetting, soundSetting] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.VIBRATION_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED),
        ]);

        setVibrationEnabled(vibrationSetting !== "false");
        setSoundEnabled(soundSetting !== "false");
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  // 振動の処理
  const handleVibration = useCallback(
    (pattern: number[]) => {
      if (!vibrationEnabled || Platform.OS === "web") return;

      // iOS では Haptics API を使用
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      }

      // Android では振動パターンを使用
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.error("Vibration failed:", error);
      }
    },
    [vibrationEnabled]
  );

  // 音の処理
  const handleSound = useCallback(
    (pattern: SoundPattern) => {
      if (!soundEnabled || Platform.OS !== "web") return;

      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = pattern.frequency;
        gainNode.gain.value = 0.1;

        oscillator.start();

        if (pattern.repeat) {
          let count = 0;
          const interval = setInterval(() => {
            count++;
            if (count >= pattern.repeat!) {
              clearInterval(interval);
              oscillator.stop();
              audioContext.close();
            }
          }, pattern.duration);
        } else {
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, pattern.duration);
        }
      } catch (error) {
        console.error("Sound failed:", error);
      }
    },
    [soundEnabled]
  );

  // 設定の更新
  const updateSettings = useCallback(
    async (vibration: boolean, sound: boolean) => {
      try {
        await Promise.all([
          AsyncStorage.setItem(
            STORAGE_KEYS.VIBRATION_ENABLED,
            vibration.toString()
          ),
          AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, sound.toString()),
        ]);

        setVibrationEnabled(vibration);
        setSoundEnabled(sound);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    },
    []
  );

  return {
    vibrationEnabled,
    soundEnabled,
    handleVibration,
    handleSound,
    updateSettings,
  };
};
