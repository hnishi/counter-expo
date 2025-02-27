import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

interface SettingsPanelProps {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  onUpdateSettings: (vibration: boolean, sound: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  vibrationEnabled,
  soundEnabled,
  onUpdateSettings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>振動</Text>
        <TouchableOpacity
          style={[styles.button, vibrationEnabled && styles.buttonActive]}
          onPress={() => onUpdateSettings(!vibrationEnabled, soundEnabled)}
        >
          <Text style={styles.buttonText}>
            {vibrationEnabled ? "ON" : "OFF"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>音声</Text>
        <TouchableOpacity
          style={[styles.button, soundEnabled && styles.buttonActive]}
          onPress={() => onUpdateSettings(vibrationEnabled, !soundEnabled)}
        >
          <Text style={styles.buttonText}>{soundEnabled ? "ON" : "OFF"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    right: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    ...(Platform.OS === "web" && {
      // @ts-ignore
      backdropFilter: "blur(8px)",
    }),
    minWidth: 200,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  settingLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  buttonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
});
