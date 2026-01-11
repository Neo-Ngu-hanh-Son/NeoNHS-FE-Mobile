import { Text } from "react-native";
import { Link } from "@react-navigation/native";
import { theme } from "@/theme/colors";
import { StyleSheet } from "react-native";
import { ReactNode } from "react";

export default function AppLink({
  screen,
  params = {},
  children,
}: {
  screen: string;
  params?: object;
  children: ReactNode;
}) {
  return (
    <Link screen={screen} params={params}>
      <Text style={styles.textLink}>{children}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  textLink: {
    fontSize: 15,
    color: theme.link_button_color,
    fontWeight: "600",
  },
});
