import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import AppLink from '@/components/Navigator/AppLink';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useTranslation } from 'react-i18next';

type LoginFormProps = {
  isLoading: boolean;
  onSubmit: (email: string, password: string) => void;
};

export default function LoginForm(props: LoginFormProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return t('auth.validation.email_required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t('auth.validation.email_invalid');
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return t('auth.validation.password_required');
    }
    if (value.length < 6) {
      return t('auth.validation.password_min_length');
    }
    return '';
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
            if (emailError) setEmailError('');
          }}
          className={emailError ? 'border-destructive' : ''}
        />
        {emailError ? <Text className="text-destructive">{emailError}</Text> : null}
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Label style={styles.label}>{t('auth.form.password_label')}</Label>
        <Input
          placeholder={t('auth.form.password_placeholder')}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
          className={passwordError ? 'border-destructive' : ''}
        />
        {passwordError ? <Text className="text-destructive">{passwordError}</Text> : null}
      </View>

      {/* Forgot Password Link */}
      <View style={styles.forgotPasswordRow}>
        <AppLink screen="ForgotPassword" params={{}}>
          {t('auth.forgot_password')}
        </AppLink>
      </View>

      {/* Sign In Button */}
      <Button onPress={handleSubmit} disabled={props.isLoading} size="lg" className="mt-2">
        <Text className="text-base font-semibold text-primary-foreground">{t('auth.button.login')}</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
});
