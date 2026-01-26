import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { IconButton } from "@/components/Buttons/IconButton";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { AuthStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AppLink from "@/components/Navigator/AppLink";
import LoginForm from "../components/LoginForm";

type LoginScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, "Login">,
  StackScreenProps<RootStackParamList>
>;

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email: email.trim(), password });
      navigation.replace("Main", {
        screen: "Tabs",
        params: { screen: "Home" },
      });
    } catch (error) {
      Alert.alert(
        "Login Failed",
        (error as Error).message || "Unable to sign in. Please try again."
      );
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Coming Soon", "Google sign-in will be available soon.");
  };

  return (
    <AuthLayout
      isLoading={isLoading}
      imageSource={{
        uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Sign in to continue exploring
          </Text>
        </View>

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <Separator className="flex-1" />
          <Text style={[styles.dividerText, { color: theme.mutedForeground }]}>
            or continue with
          </Text>
          <Separator className="flex-1" />
        </View>

        {/* Google Login */}
        <View style={styles.socialContainer}>
          <IconButton
            icon="logo-google"
            onPress={handleGoogleLogin}
            iconSize={22}
            color={theme.foreground}
            buttonStyle={[styles.googleButton, { borderColor: theme.border }]}
          >
            Google
          </IconButton>
        </View>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            Don't have an account?{" "}
          </Text>
          <AppLink screen="Register" params={{}}>
            Sign Up
          </AppLink>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  forgotPasswordRow: {
    alignItems: "flex-end",
    marginTop: -4,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 28,
  },
  dividerText: {
    fontSize: 13,
  },
  socialContainer: {
    alignItems: "center",
  },
  googleButton: {
    minWidth: 200,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
});
