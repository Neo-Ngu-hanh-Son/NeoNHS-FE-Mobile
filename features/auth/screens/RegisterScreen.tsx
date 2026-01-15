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

type RegisterScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, "Register">,
  StackScreenProps<RootStackParamList>
>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, isLoading } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Name is required";
    }
    if (value.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

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

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return "Please confirm your password";
    }
    if (value !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleRegister = async () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);

    if (nameErr || emailErr || passwordErr || confirmErr) return;

    try {
      await register({ 
        name: name.trim(), 
        email: email.trim(), 
        password 
      });
      navigation.replace("Main", {
        screen: "Tabs",
        params: { screen: "Home" },
      });
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        (error as Error).message || "Unable to create account. Please try again."
      );
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert("Coming Soon", "Google sign-up will be available soon.");
  };

  return (
    <AuthLayout isLoading={isLoading}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Join us and start your journey today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>Full Name</Label>
            <Input
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError("");
              }}
              className={nameError ? "border-destructive" : ""}
            />
            {nameError ? (
              <Text style={[styles.errorText, { color: theme.destructive }]}>{nameError}</Text>
            ) : null}
          </View>

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
              placeholder="Create a password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
                if (confirmPassword && text !== confirmPassword) {
                  setConfirmPasswordError("Passwords do not match");
                } else if (confirmPassword) {
                  setConfirmPasswordError("");
                }
              }}
              className={passwordError ? "border-destructive" : ""}
            />
            {passwordError ? (
              <Text style={[styles.errorText, { color: theme.destructive }]}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>Confirm Password</Label>
            <Input
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError("");
              }}
              className={confirmPasswordError ? "border-destructive" : ""}
            />
            {confirmPasswordError ? (
              <Text style={[styles.errorText, { color: theme.destructive }]}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Sign Up Button */}
          <Button
            onPress={handleRegister}
            disabled={isLoading}
            size="lg"
            className="mt-4"
          >
            <Text className="text-primary-foreground font-semibold text-base">
              Create Account
            </Text>
          </Button>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <Separator className="flex-1" />
          <Text style={[styles.dividerText, { color: theme.mutedForeground }]}>
            or sign up with
          </Text>
          <Separator className="flex-1" />
        </View>

        {/* Google Sign Up */}
        <View style={styles.socialContainer}>
          <IconButton
            icon="logo-google"
            onPress={handleGoogleSignup}
            iconSize={22}
            color={theme.foreground}
            buttonStyle={[styles.googleButton, { borderColor: theme.border }]}
          >
            Google
          </IconButton>
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <AppLink screen="Login" params={{}}>
            Sign In
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
    marginBottom: 24,
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
    gap: 14,
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
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 24,
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
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
});
