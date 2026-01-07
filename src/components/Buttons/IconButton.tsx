import { Button, View } from "@ant-design/react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, ViewStyle } from "react-native";
import type { ComponentProps, ReactNode } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

type IconButtonProps = {
  color?: string;
  onPress?: () => void;
  icon: IconName;
  iconSize?: number;
  children?: ReactNode;
  buttonStyle?: ViewStyle;
  borderless?: boolean;
  loading?: boolean;
};

export function IconButton(props: IconButtonProps) {
  return (
    <Button
      loading={props.loading ? true : false}
      type="ghost"
      style={{ ...styles.buttonStyle, ...props.buttonStyle, borderWidth: props.borderless ? 0 : 1 }}
      activeStyle={styles.pressed}
      onPress={props.onPress}
    >
      <View style={[styles.innerContainer, props.children ? { gap: 12 } : {}]}>
        {!props.loading && (
          <Ionicons name={props.icon} size={props.iconSize || 24} color={props.color} />
        )}
        <Text style={styles.text}>{props.children}</Text>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  buttonStyle: {
    backgroundColor: "transparent",
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
});
