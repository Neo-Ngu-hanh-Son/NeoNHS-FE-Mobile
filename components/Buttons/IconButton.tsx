import { Button, type ButtonProps } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View, ViewStyle, ActivityIndicator } from "react-native";
import type { ComponentProps, ReactNode } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type IconButtonProps = {
  color?: string;
  onPress?: () => void;
  icon: IconName;
  iconSize?: number;
  children?: ReactNode;
  buttonStyle?: ViewStyle | ViewStyle[];
  borderless?: boolean;
  loading?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export function IconButton(props: IconButtonProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  
  // Determine button variant
  const variant = props.variant || (props.borderless ? "ghost" : "outline");
  
  // Determine icon color based on variant
  // default variant uses primaryForeground, others use foreground (or custom color)
  const getIconColor = () => {
    if (props.color) return props.color;
    if (variant === "default") return theme.primaryForeground;
    if (variant === "destructive") return theme.primaryForeground;
    return theme.foreground;
  };
  
  const iconColor = getIconColor();

  const buttonContent = (
    <View style={styles.innerContainer}>
      {props.loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons name={props.icon} size={props.iconSize || 24} color={iconColor} />
      )}
      {props.children && <Text className="text-sm font-medium">{props.children}</Text>}
    </View>
  );

  return (
    <Button
      variant={variant}
      size={props.size}
      disabled={props.loading}
      onPress={props.onPress}
      style={props.buttonStyle}
      className={props.children ? undefined : "px-2"}
    >
      {buttonContent}
    </Button>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});
