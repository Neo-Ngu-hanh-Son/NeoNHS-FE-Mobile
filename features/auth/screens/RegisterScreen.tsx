import { Alert, StyleSheet, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { AuthStackParamList, RootStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AppLink from '@/components/Navigator/AppLink';
import RegisterForm from '../components/RegisterForm';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type RegisterScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, 'Register'>,
  StackScreenProps<RootStackParamList>
>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  const handleRegister = async (
    fullname: string,
    email: string,
    password: string,
    phoneNumber: string
  ) => {
    try {
      setLoading(true);
      await register({ fullname, email, password, phoneNumber: phoneNumber.trim() || null });
      Alert.alert(
        t('auth.alert.registration_successful_title'),
        t('auth.alert.registration_successful_message'),
        [
          {
            text: t('auth.button.verify_email'),
            onPress: () => {
              navigation.replace('VerifyEmail', { email: email.trim(), fromRegister: true });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('auth.alert.registration_failed_title'),
        (error as Error).message || t('auth.alert.registration_failed_message')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout isLoading={loading}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>{t('auth.create_account')}</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('auth.join_us')}
          </Text>
        </View>

        <RegisterForm onSubmit={handleRegister} isLoading={loading} />

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            {t('auth.already_account')}{' '}
          </Text>
          <AppLink screen="Login" params={{}}>
            {t('auth.button.login')}
          </AppLink>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  dividerText: {
    fontSize: 13,
  },
  socialContainer: {
    alignItems: 'center',
  },
  googleButton: {
    minWidth: 200,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
});
