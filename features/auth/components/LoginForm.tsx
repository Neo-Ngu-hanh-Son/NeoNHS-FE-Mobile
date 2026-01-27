import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import AppLink from "@/components/Navigator/AppLink";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

type LoginFormProps = {
  isLoading: boolean;
  onSubmit: (email: string, password: string) => void;
}

export default function LoginForm(props: LoginFormProps) {
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

  function handleSubmit() {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }
    props.onSubmit(email, password);
  }

  return (
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
          <Text className="text-destructive">{emailError}</Text>
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
          <Text className="text-destructive">{passwordError}</Text>
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
        onPress={handleSubmit}
        disabled={props.isLoading}
        size="lg"
        className="mt-2"
      >
        <Text className="text-primary-foreground font-semibold text-base">
          Sign In
        </Text>
      </Button>
    </View>
  )
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