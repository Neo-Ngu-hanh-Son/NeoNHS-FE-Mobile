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

type LoginScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, "Login">,
  StackScreenProps<RootStackParamList>
>;

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

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

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>Email</Label>
            <Input
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              className={emailError ? "border-destructive" : ""}
            />
            {emailError ? (
              <Text style={[styles.errorText, { color: theme.destructive }]}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>Password</Label>
            <Input
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              className={passwordError ? "border-destructive" : ""}
            />
            {passwordError ? (
              <Text style={[styles.errorText, { color: theme.destructive }]}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordRow}>
            <AppLink screen="ForgotPassword" params={{}}>
              Forgot password?
            </AppLink>
          </View>

          {/* Sign In Button */}
          <Button
            onPress={handleLogin}
            disabled={isLoading}
            size="lg"
            className="mt-2"
          >
            <Text className="text-primary-foreground font-semibold text-base">
              Sign In
            </Text>
          </Button>
        </View>

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
