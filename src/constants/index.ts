export const STORAGE_KEYS = {
  COUNT: "counter-expo-count",
  VIBRATION_ENABLED: "counter-expo-vibration-enabled",
  SOUND_ENABLED: "counter-expo-sound-enabled",
} as const;

export const KEY_MAPPINGS = {
  INCREMENT: ["ArrowUp", "KeyK"] as string[],
  DECREMENT: ["ArrowDown", "KeyJ"] as string[],
  RESET: ["KeyR"] as string[],
};

export const VIBRATION_PATTERNS = {
  COUNT_UP: [50],
  COUNT_DOWN: [50],
  RESET: [50, 100, 50],
};

export const SOUND_PATTERNS = {
  COUNT_UP: { frequency: 200, duration: 100 },
  COUNT_DOWN: { frequency: 150, duration: 100 },
  RESET: { frequency: 100, duration: 100, repeat: 2 },
};
