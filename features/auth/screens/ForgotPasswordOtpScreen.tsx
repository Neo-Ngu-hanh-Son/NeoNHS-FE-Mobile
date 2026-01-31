import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { AuthStackParamList } from "@/app/navigations/NavigationParamTypes";
import { authService } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AppLink from "@/components/Navigator/AppLink";

type ForgotPasswordOtpScreenProps = StackScreenProps<AuthStackParamList, "ForgotPasswordOtp">;

export default function ForgotPasswordOtpScreen({ navigation, route }: ForgotPasswordOtpScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { email } = route.params;



  const validatePassword = (value: string) => {
    if (!value) {
      return "New password is required";
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
    if (value !== newPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleResetPassword = async () => {
    const passwordErr = validatePassword(newPassword);
    const confirmErr = validateConfirmPassword(confirmPassword);

    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);

    if (passwordErr || confirmErr) return;

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(email, newPassword, confirmPassword);
      if (response.status === 200) {
        Alert.alert(
          "Password Reset Successful",
          "Your password has been updated. Please sign in with your new password.",
          [
            {
              text: "Sign In",
              onPress: () => navigation.replace("Login"),
            },
          ]
        );
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert(
        "Reset Failed",
        (error as Error).message || "Unable to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout isLoading={isLoading}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Enter the code sent to your email and create a new password.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>


          {/* New Password Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>New Password</Label>
            <Input
              placeholder="Create a new password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
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
            <Label style={styles.label}>Confirm New Password</Label>
            <Input
              placeholder="Confirm your new password"
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

          {/* Reset Password Button */}
          <Button
            onPress={handleResetPassword}
            disabled={isLoading}
            size="lg"
            className="mt-4"
          >
            <Text className="text-primary-foreground font-semibold text-base">
              Reset Password
            </Text>
          </Button>
        </View>

        {/* Resend Code Link */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.mutedForeground }]}>
            Didn't receive the code?{" "}
          </Text>
          <AppLink screen="ForgotPassword" params={{}}>
            Resend
          </AppLink>
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            Remember your password?{" "}
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
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
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
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
});
