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
import { useTranslation } from "react-i18next";

type ForgotPasswordOtpScreenProps = StackScreenProps<AuthStackParamList, "ForgotPasswordOtp">;

export default function ForgotPasswordOtpScreen({ navigation, route }: ForgotPasswordOtpScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { email } = route.params;



  const validatePassword = (value: string) => {
    if (!value) {
      return t("auth.validation.new_password_required");
    }
    if (value.length < 6) {
      return t("auth.validation.password_min_length");
    }
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return t("auth.validation.confirm_password_required");
    }
    if (value !== newPassword) {
      return t("auth.validation.passwords_not_match");
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
          t("auth.alert.password_reset_successful_title"),
          t("auth.alert.password_reset_successful_message"),
          [
            {
              text: t("auth.button.login"),
              onPress: () => navigation.replace("Login"),
            },
          ]
        );
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert(
        t("auth.alert.reset_failed_title"),
        (error as Error).message || t("auth.alert.reset_failed_message")
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
          <Text style={[styles.title, { color: theme.foreground }]}>{t("auth.reset_password")}</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t("auth.reset_password_subtitle")}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>


          {/* New Password Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>{t("auth.form.new_password_label")}</Label>
            <Input
              placeholder={t("auth.form.new_password_placeholder")}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (passwordError) setPasswordError("");
                if (confirmPassword && text !== confirmPassword) {
                  setConfirmPasswordError(t("auth.validation.passwords_not_match"));
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
            <Label style={styles.label}>{t("auth.form.confirm_password_label")}</Label>
            <Input
              placeholder={t("auth.form.confirm_password_placeholder")}
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
              {t("auth.button.reset_password")}
            </Text>
          </Button>
        </View>

        {/* Resend Code Link */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.mutedForeground }]}>
            {t("auth.resend.no_code")}{" "}
          </Text>
          <AppLink screen="ForgotPassword" params={{}}>
            {t("auth.resend.resend")}
          </AppLink>
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            {t("auth.remember_password")}{" "}
          </Text>
          <AppLink screen="Login" params={{}}>
            {t("auth.button.login")}
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
