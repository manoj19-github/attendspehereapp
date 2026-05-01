import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { X } from 'lucide-react-native';
import StarRating from './StarRating';
import Modal from 'react-native-modal';

interface ReviewModalProps {
  visible: boolean;
  userName?: string;
  onClose: () => void;
  onSubmit: (payload: { rating: number; review: string }) => void;
}

const THEME = {
  bg: "#FFFFFF",
  text: "#2D2D2D",
  muted: "#7A7A7A",
  title: "#7A2F2F",
  orange: "#E87305",
  orangeDark: "#B13A10",
  border: "rgba(122,47,47,0.35)",
  cardBorder: "rgba(122,47,47,0.35)",
  line: "rgba(0,0,0,0.08)",
};
const ReviewModal = ({
  visible,
  userName = 'Uttam Thapa',
  onClose,
  onSubmit,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(4);
  const [review, setReview] = useState('');

  const closeAndReset = () => {
    // optional reset each time
    setRating(4);
    setReview('');
    onClose();
  };
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={closeAndReset}
      onBackButtonPress={closeAndReset}
      backdropOpacity={0.25}
      style={styles.modalWrap}
      useNativeDriver
    >
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Leave a Review</Text>
          <TouchableOpacity
            onPress={closeAndReset}
            activeOpacity={0.85}
            style={styles.closeBtn}
          >
            <X size={18} color={THEME.title} />
          </TouchableOpacity>
        </View>

        <View style={styles.sheetDivider} />

        <Text style={styles.sheetQuestion}>
          How was your experience with {userName} ?
        </Text>
        <Text style={styles.sheetHint}>
          Please give your rating and also your review.
        </Text>

        <StarRating value={rating} onChange={setRating} />

        <View style={styles.inputBox}>
          <TextInput
            placeholder="Write your review..."
            placeholderTextColor="rgba(0,0,0,0.30)"
            value={review}
            onChangeText={setReview}
            multiline
            style={styles.textArea}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.submitBtn}
          onPress={() => {
            onSubmit({ rating, review });
            // keep modal open? usually close after submit:
            closeAndReset();
          }}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ReviewModal;

const styles = StyleSheet.create({
    // Modal styles
  modalWrap: { justifyContent: "flex-end", margin: 0 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.16)",
    marginBottom: 10,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center" },
  sheetTitle: { flex: 1, fontSize: 22, fontWeight: "900", color: THEME.title },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDivider: { height: 1, backgroundColor: THEME.line, marginVertical: 12 },

  sheetQuestion: { fontSize: 16, color: THEME.title, fontWeight: "800" },
  sheetHint: { marginTop: 6, fontSize: 12, color: THEME.muted, fontWeight: "600" },



  inputBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 80,
    fontSize: 13,
    color: THEME.text,
    fontWeight: "600",
  },

  submitBtn: {
    marginTop: 14,
    backgroundColor: THEME.orangeDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
