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

type ForgotPasswordScreenProps = StackScreenProps<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return t("auth.validation.email_required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t("auth.validation.email_invalid");
    }
    return "";
  };

  const handleSendResetLink = async () => {
    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (emailErr) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      Alert.alert(
        t("auth.alert.check_email_title"),
        t("auth.alert.check_email_message"),
        [
          {
            text: t("common.continue"),
            onPress: () => navigation.navigate("EnterOtp", { email }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t("auth.alert.request_failed_title"),
        (error as Error).message || t("auth.alert.request_failed_message")
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
          <Text style={[styles.title, { color: theme.foreground }]}>{t("auth.forgot_password")}</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t("auth.forgot_password_subtitle")}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Label style={styles.label}>{t("auth.form.email_label")}</Label>
            <Input
              placeholder={t("auth.form.email_placeholder")}
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

          {/* Send Reset Link Button */}
          <Button
            onPress={handleSendResetLink}
            disabled={isLoading}
            size="lg"
            className="mt-4"
          >
            <Text className="text-primary-foreground font-semibold text-base">
              {t("auth.button.send_reset_code")}
            </Text>
          </Button>
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            {t("auth.already_account")}{" "}
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
    marginBottom: 32,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
  },
  footerText: {
    fontSize: 14,
  },
});
