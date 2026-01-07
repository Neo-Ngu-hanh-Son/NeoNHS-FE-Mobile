import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "@ant-design/react-native";
import { theme } from "@/theme/colors";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({ visible, message = "Loading..." }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={styles.container}>
          <ActivityIndicator
            animating
            toast={false}
            size="large"
            text={undefined}
            color={theme.brand_primary}
          />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    minWidth: 140,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 12,
    textAlign: "center",
  },
});

