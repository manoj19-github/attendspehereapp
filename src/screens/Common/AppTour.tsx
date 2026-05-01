import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { CopilotStep, walkthroughable } from "react-native-copilot";

export const WalkthroughableView = walkthroughable(View);
export const TourStep = CopilotStep;

export const AppTourTooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  stepNumber,
  totalSteps,
}: any) => {
  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{currentStep?.name || "Tip"}</Text>
        {typeof stepNumber === "number" && typeof totalSteps === "number" ? (
          <Text style={styles.counter}>
            {stepNumber}/{totalSteps}
          </Text>
        ) : null}
      </View>

      {/* ✅ keep tooltip small, scroll text inside */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={true}>
        <Text style={styles.desc}>{currentStep?.text || ""}</Text>
      </ScrollView>

      <View style={styles.actions}>
        {!isFirstStep ? (
          <Pressable style={styles.btnGhost} onPress={handlePrev}>
            <Text style={styles.btnGhostText}>Back</Text>
          </Pressable>
        ) : (
          <View style={{ width: 72 }} />
        )}

        {!isLastStep ? (
          <Pressable style={styles.btnGhost} onPress={handleStop}>
            <Text style={styles.btnGhostText}>Skip</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.btnPrimary}
          onPress={isLastStep ? handleStop : handleNext}
        >
          <Text style={styles.btnPrimaryText}>
            {isLastStep ? "Done" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    paddingRight: 10,
  },
  counter: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    maxHeight: 120, // ✅ key: prevents big overlay
    marginBottom: 10,
  },
  desc: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  btnGhost: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  btnGhostText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12.5,
    fontWeight: "700",
  },
  btnPrimary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#E87305",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "800",
  },
});