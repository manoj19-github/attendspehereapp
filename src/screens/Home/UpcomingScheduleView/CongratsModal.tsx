import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Check } from "lucide-react-native";

type CongratsModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
};

export default function CongratsModal({
  visible,
  onClose,
  title = "Congratulations!",
  message = "You have successfully completed the job.",
  buttonText = "Thanks",
}: CongratsModalProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.35}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Check size={24} color="#1E8E3E" />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={onClose} style={styles.btn}>
          <Text style={styles.btnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const ORANGE = "#E87305";
const ORANGE_DARK = "#B13A10";
const BORDER = "#D7A39A";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: "center",

    borderWidth: 1.5,
    borderColor: BORDER,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  iconWrap: {
    marginTop: 4,
    marginBottom: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: "#1E8E3E",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3FFF6",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3A2A24",
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: "#9B3D3D",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 18,
  },

  btn: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ORANGE,

    shadowColor: ORANGE_DARK,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
