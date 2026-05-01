import { useCallback, useEffect, useRef } from "react";
import { InteractionManager } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCopilot } from "react-native-copilot";

type Options = {
  canRun: boolean;
  onStop?: () => void; // called when user finishes or skips
  startDelayMs?: number;
};

export function useRunCopilotOnce({ canRun, onStop, startDelayMs = 600 }: Options) {
  const { start, copilotEvents } = useCopilot();
  const startedRef = useRef(false);

  // listen for tour stop (finish OR skip ends the tour)
  useEffect(() => {
    if (!copilotEvents?.on) return;

    const sub: any = copilotEvents.on("stop", () => {
      startedRef.current = false; // reset for safety (screen may remount)
      onStop?.();
    });

    return () => {
      sub?.remove?.();
    };
  }, [copilotEvents, onStop]);

  useFocusEffect(
    useCallback(() => {
      if (!canRun) return;

      if (startedRef.current) return;
      startedRef.current = true;

      const task = InteractionManager.runAfterInteractions(() => {
        const t = setTimeout(() => start(), startDelayMs);
        return () => clearTimeout(t);
      });

      return () => task?.cancel?.();
    }, [canRun, start, startDelayMs]),
  );
}