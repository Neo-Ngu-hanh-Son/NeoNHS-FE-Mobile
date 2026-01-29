import { Alert, StyleSheet, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { IconButton } from "@/components/Buttons/IconButton";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { AuthStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AppLink from "@/components/Navigator/AppLink";
import RegisterForm from "../components/RegisterForm";

type RegisterScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, "Register">,
  StackScreenProps<RootStackParamList>
>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, isLoading } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const handleRegister = async (fullname: string, email: string, password: string, phoneNumber: string) => {
    try {
      await register({ fullname, email, password, phoneNumber: phoneNumber.trim() || null });
      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please verify your email to continue.",
        [
          {
            text: "Verify Email",
            onPress: () => {
              navigation.replace("VerifyEmail", { email: email.trim(), fromRegister: true });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        (error as Error).message || "Unable to create account. Please try again."
      );
    }
  };

  return (
    <AuthLayout isLoading={isLoading}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Join us and start your journey today
          </Text>
        </View>

        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <Separator className="flex-1" />
          <Text style={[styles.dividerText, { color: theme.mutedForeground }]}>
            or sign up with
          </Text>
          <Separator className="flex-1" />
        </View>

        {/* Google Sign Up */}
        {
          /*
          <View style={styles.socialContainer}>
          <IconButton
            icon="logo-google"
            onPress={handleGoogleSignup}
            iconSize={22}
            color={theme.foreground}
            buttonStyle={[styles.googleButton, { borderColor: theme.border }]}
          >
            Google
          </IconButton>
        </View>
          */
        }


        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            Already have an account?{" "}
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
    marginBottom: 24,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 24,
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
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
});
