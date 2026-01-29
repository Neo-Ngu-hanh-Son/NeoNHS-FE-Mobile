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

type VerifyEmailScreenProps = StackScreenProps<AuthStackParamList, "VerifyEmail">;

type VerificationStep = "email" | "otp";

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

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
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateOtp = (value: string) => {
    if (!value.trim()) {
      return "Verification code is required";
    }
    if (value.trim().length < 4) {
      return "Please enter a valid verification code";
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
      "Code Sent",
      "A verification code is being sent to your email. Please check your inbox."
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
        "Verification Successful",
        "Your email has been verified. You can now sign in to your account.",
        [
          {
            text: "Sign In",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        (error as Error).message || "Invalid verification code. Please try again."
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
            Verify Your Email
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {step === "email"
              ? "Enter your email address to receive a verification code."
              : `We've sent a verification code to ${email}. Please enter it below.`}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === "email" ? (
            <>
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
                  Send Verification Code
                </Text>
              </Button>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Label style={styles.label}>Verification Code</Label>
                <Input
                  placeholder="Enter the code"
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
                  Verify Email
                </Text>
              </Button>

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: theme.mutedForeground }]}>
                  Didn't receive the code?{" "}
                </Text>
                {resendCooldown > 0 ? (
                  <Text style={[styles.cooldownText, { color: theme.mutedForeground }]}>
                    Resend in {resendCooldown}s
                  </Text>
                ) : (
                  <Text
                    style={[styles.linkText, { color: theme.primary }]}
                    onPress={handleResendOtp}
                  >
                    Resend
                  </Text>
                )}
              </View>

              {/* Change Email */}
              <View style={styles.changeEmailContainer}>
                <Text style={[styles.resendText, { color: theme.mutedForeground }]}>
                  Wrong email?{" "}
                </Text>
                <Text
                  style={[styles.linkText, { color: theme.primary }]}
                  onPress={handleChangeEmail}
                >
                  Change email
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            Already verified?{" "}
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
