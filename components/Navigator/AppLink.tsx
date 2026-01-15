import { Text, StyleSheet } from "react-native";
import { Link } from "@react-navigation/native";
import { ReactNode } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

export default function AppLink({
  screen,
  params = {},
  children,
}: {
  screen: string;
  params?: object;
  children: ReactNode;
}) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Link screen={screen} params={params}>
      <Text style={[styles.textLink, { color: theme.primary }]}>{children}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  textLink: {
    fontSize: 15,
    fontWeight: "600",
  },
});
