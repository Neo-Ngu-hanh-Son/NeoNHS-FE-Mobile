import { useState, useEffect } from "react";
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

type VerifyEmailScreenProps = StackScreenProps<AuthStackParamList, "VerifyEmail">;

type VerificationStep = "email" | "otp";

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  // Get params from navigation
  const initialEmail = route.params?.email ?? "";
  const fromRegister = route.params?.fromRegister ?? false;

  const [step, setStep] = useState<VerificationStep>(initialEmail ? "otp" : "email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");

  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-send OTP if email is pre-filled (from login redirect, not from register)
  // When coming from register, the backend already sends the email
  useEffect(() => {
    if (initialEmail && !fromRegister) {
      // Fire and forget - don't wait for the response
      sendOtpAsync(initialEmail);
    }
    // Set initial cooldown if coming from register (email was already sent)
    if (fromRegister) {
      setResendCooldown(60);
    }
  }, []);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return t("auth.validation.email_required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t("auth.validation.email_invalid");
    }
    return "";
  };

  const validateOtp = (value: string) => {
    if (!value.trim()) {
      return t("auth.validation.verification_code_required");
    }
    if (value.trim().length < 4) {
      return t("auth.validation.verification_code_invalid");
    }
    return "";
  };

  // Fire and forget version - doesn't block UI
  const sendOtpAsync = (emailToSend: string) => {
    authService.resendVerifyEmail(emailToSend.trim()).catch((error) => {
      // Silently log error, user can manually resend if needed
      console.warn("Failed to send verification email:", error);
    });
    setResendCooldown(60); // 60 seconds cooldown
  };

  // Used when user manually enters email and clicks send
  const handleSendOtp = (emailToSend: string = email) => {
    const emailErr = validateEmail(emailToSend);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    // Move to OTP step immediately
    setStep("otp");
    setResendCooldown(60); // 60 seconds cooldown

    // Fire and forget - don't block UI
    authService.resendVerifyEmail(emailToSend.trim()).catch((error) => {
      console.warn("Failed to send verification email:", error);
    });

    Alert.alert(
      t("auth.alert.code_sent_title"),
      t("auth.alert.code_sent_message")
    );
  };

  const handleVerify = async () => {
    const otpErr = validateOtp(otp);
    if (otpErr) {
      setOtpError(otpErr);
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail(email.trim(), otp.trim());
      Alert.alert(
        t("auth.alert.verification_successful_title"),
        t("auth.alert.verification_successful_message"),
        [
          {
            text: t("auth.button.login"),
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t("auth.alert.verification_failed_title"),
        (error as Error).message || t("auth.alert.verification_failed_message")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    handleSendOtp();
  };

  const handleChangeEmail = () => {
    setStep("email");
    setOtp("");
    setOtpError("");
  };

  return (
    <AuthLayout isLoading={isLoading}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t("auth.verify_email")}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {step === "email"
              ? t("auth.verify_email_subtitle_email")
              : t("auth.verify_email_subtitle_otp", { email })}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === "email" ? (
            <>
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
                  <Text style={[styles.errorText, { color: theme.destructive }]}>
                    {emailError}
                  </Text>
                ) : null}
              </View>

              {/* Send Code Button */}
              <Button
                onPress={() => handleSendOtp()}
                disabled={isLoading}
                size="lg"
                className="mt-4"
              >
                <Text className="text-primary-foreground font-semibold text-base">
                  {t("auth.button.send_verification_code")}
                </Text>
              </Button>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Label style={styles.label}>{t("auth.form.verification_code_label")}</Label>
                <Input
                  placeholder={t("auth.form.verification_code_placeholder")}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    if (otpError) setOtpError("");
                  }}
                  className={otpError ? "border-destructive" : ""}
                />
                {otpError ? (
                  <Text style={[styles.errorText, { color: theme.destructive }]}>
                    {otpError}
                  </Text>
                ) : null}
              </View>

              {/* Verify Button */}
              <Button
                onPress={handleVerify}
                disabled={isLoading}
                size="lg"
                className="mt-4"
              >
                <Text className="text-primary-foreground font-semibold text-base">
                  {t("auth.button.verify_email")}
                </Text>
              </Button>

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: theme.mutedForeground }]}>
                  {t("auth.resend.no_code")}{" "}
                </Text>
                {resendCooldown > 0 ? (
                  <Text style={[styles.cooldownText, { color: theme.mutedForeground }]}>
                    {t("auth.resend.resend_in", { seconds: resendCooldown })}
                  </Text>
                ) : (
                  <Text
                    style={[styles.linkText, { color: theme.primary }]}
                    onPress={handleResendOtp}
                  >
                    {t("auth.resend.resend")}
                  </Text>
                )}
              </View>

              {/* Change Email */}
              <View style={styles.changeEmailContainer}>
                <Text style={[styles.resendText, { color: theme.mutedForeground }]}>
                  {t("auth.resend.wrong_email")}{" "}
                </Text>
                <Text
                  style={[styles.linkText, { color: theme.primary }]}
                  onPress={handleChangeEmail}
                >
                  {t("auth.resend.change_email")}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            {t("auth.already_verified")}{" "}
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
    marginTop: 20,
  },
  changeEmailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  resendText: {
    fontSize: 14,
  },
  cooldownText: {
    fontSize: 14,
    fontWeight: "500",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
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
