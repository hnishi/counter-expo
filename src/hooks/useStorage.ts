import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";

export const useStorage = () => {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);

  // 初期値の読み込み
  useEffect(() => {
    const loadCount = async () => {
      try {
        const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.COUNT);
        if (savedCount !== null) {
          const parsedCount = parseInt(savedCount, 10);
          setCount(parsedCount);
          setPrevCount(parsedCount);
        }
      } catch (error) {
        console.error("Failed to load count:", error);
      }
    };

    loadCount();
  }, []);

  // カウントの保存
  const saveCount = useCallback(async (newCount: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COUNT, newCount.toString());
    } catch (error) {
      console.error("Failed to save count:", error);
    }
  }, []);

  // カウントの増加
  const increment = useCallback(() => {
    setPrevCount(count);
    setCount((prev) => {
      const newCount = prev + 1;
      saveCount(newCount);
      return newCount;
    });
  }, [count, saveCount]);

  // カウントの減少
  const decrement = useCallback(() => {
    setPrevCount(count);
    setCount((prev) => {
      const newCount = prev - 1;
      saveCount(newCount);
      return newCount;
    });
  }, [count, saveCount]);

  // カウントのリセット
  const reset = useCallback(() => {
    setPrevCount(count);
    setCount(0);
    saveCount(0);
  }, [count, saveCount]);

  return {
    count,
    prevCount,
    increment,
    decrement,
    reset,
  };
};
