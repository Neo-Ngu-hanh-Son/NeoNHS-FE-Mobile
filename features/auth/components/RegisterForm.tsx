import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { useTranslation } from "react-i18next";

type RegisterFormProps = {
  isLoading: boolean;
  onSubmit: (name: string, email: string, password: string, phoneNumber: string) => void;
};

export default function RegisterForm({ isLoading, onSubmit }: RegisterFormProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

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
      return t("auth.validation.fullname_required", "Name is required");
    }
    if (value.trim().length < 2) {
      return t("auth.validation.fullname_min_length", "Name must be at least 2 characters");
    }
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return t("auth.validation.email_required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t("auth.validation.email_invalid");
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return t("auth.validation.password_required");
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
    if (value !== password) {
      return t("auth.validation.passwords_not_match");
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
        <Label style={styles.label}>{t('auth.form.fullname_label')}</Label>
        <Input
          placeholder={t('auth.form.fullname_placeholder')}
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
        <Label style={styles.label}>{t('auth.form.email_label')}</Label>
        <Input
          placeholder={t('auth.form.email_placeholder')}
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
        <Label style={styles.label}>{t('auth.form.password_label')}</Label>
        <Input
          placeholder={t('auth.form.password_placeholder')}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
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
        <Label style={styles.label}>{t('auth.form.confirm_password_label')}</Label>
        <Input
          placeholder={t('auth.form.confirm_password_placeholder')}
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
        <Label style={styles.label}>{t('auth.form.phone_label')}</Label>
        <Input
          placeholder={t('auth.form.phone_placeholder')}
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
          {t('auth.button.register')}
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
