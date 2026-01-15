import React from "react";
import { Modal, StyleSheet, View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({ visible, message = "Loading..." }: LoadingOverlayProps) {
  if (!visible) return null;

  // Note: LoadingOverlay uses light theme colors as it's typically shown 
  // over a semi-transparent backdrop and should have good contrast
  const theme = THEME.light;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <ActivityIndicator
            animating
            size="large"
            color={theme.primary}
          />
          {message ? (
            <Text style={[styles.message, { color: theme.foreground }]}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    minWidth: 140,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 14,
  },
});
