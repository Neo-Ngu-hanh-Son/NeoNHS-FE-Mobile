import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

type RegisterFormProps = {
  isLoading: boolean;
  onSubmit: (name: string, email: string, password: string, phoneNumber: string) => void;
};

export default function RegisterForm({ isLoading, onSubmit }: RegisterFormProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [phoneNumberError, setPhoneNumberError] = useState("");

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

  const handleSubmit = () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);

    if (nameErr || emailErr || passwordErr || confirmErr) return;

    onSubmit(name.trim(), email.trim(), password, phoneNumber.trim());
  };

  return (
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

      {/* Phone Number Input */}
      <View style={styles.inputGroup}>
        <Label style={styles.label}>Phone Number</Label>
        <Input
          placeholder="Enter your phone number"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="tel"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            if (phoneNumberError) setPhoneNumberError("");
          }}
          className={phoneNumberError ? "border-destructive" : ""}
        />
        {phoneNumberError ? (
          <Text style={[styles.errorText, { color: theme.destructive }]}>{phoneNumberError}</Text>
        ) : null}
      </View>

      {/* Sign Up Button */}
      <Button
        onPress={handleSubmit}
        disabled={isLoading}
        size="lg"
        className="mt-4"
      >
        <Text className="text-primary-foreground font-semibold text-base">
          Create Account
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
