import { Button, Flex, Form, Input, Text, View, WhiteSpace } from "@ant-design/react-native";
import { useAuth } from "../context/AuthContext";
import { logger } from "@/utils/logger";
import { CompositeScreenProps, Link } from "@react-navigation/native";
import { useForm } from "@ant-design/react-native/lib/form/Form";
import { Alert, StyleSheet } from "react-native";
import { theme } from "@/theme/colors";
import { IconButton } from "@/components/Buttons/IconButton";
import AuthLayout from "../components/AuthLayout";
import AppLink from "@/components/Navigator/AppLink";
import { StackScreenProps } from "@react-navigation/stack";
import { AuthStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";

type LoginScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, "Login">,
  StackScreenProps<RootStackParamList>
>;

export default function LoginScreen({ navigation, route }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const [form] = useForm();

  const onSubmit = () => {
    form.submit();
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values);
      navigation.replace("Main", {
        screen: "Tabs",
        params: { screen: "Home" },
      });
    } catch (error) {
      Alert.alert(
        "Login Error",
        (error as Error).message || "An error occurred during login. Please try again."
      );
    }
  };

  return (
    <>
      <AuthLayout
        isLoading={isLoading}
        imageSource={{
          uri: "https://shadowverse-wb.com/uploads/movie/kor/d76658d1afc58ad9d43f4c722cccf792.jpg",
        }}
      >
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign in</Text>
          <Text style={styles.formSubtitle}>Welcome to Ngu Hanh Son tourist portal!</Text>

          <WhiteSpace size="lg" />

          <Form onFinish={handleLogin} layout="vertical" form={form} style={styles.form}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
              labelStyle={styles.labelStyle}
            >
              <Input
                placeholder="Enter your email"
                type="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
                inputStyle={styles.inputTextStyle}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
              labelStyle={styles.labelStyle}
              style={{ outlineWidth: 0 }}
            >
              <Input
                type="password"
                placeholder="Enter your password"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input]}
                inputStyle={styles.inputTextStyle}
              />
            </Form.Item>

            <View style={styles.forgotPasswordContainer}>
              <Link screen="ForgotPassword" params={{}}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Link>
            </View>

            <WhiteSpace size="lg" />

            <Button type="primary" onPress={onSubmit}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Button>
          </Form>

          <WhiteSpace size="xl" />

          <Flex justify="center" align="center">
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </Flex>

          <WhiteSpace size="xl" />

          <View style={styles.googleContainer}>
            <IconButton
              icon="logo-google"
              onPress={() => {}}
              iconSize={24}
              buttonStyle={{
                borderColor: theme.border_color_base,
              }}
              color={theme.color_text_base}
            />
          </View>

          <WhiteSpace size="sm" />

          <Flex justify="center" align="center" style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <AppLink screen="Register" params={{}}>
              Register
            </AppLink>
          </Flex>
        </View>
      </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    height: 300,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  formWrapper: {
    alignItems: "center",
    marginTop: -50,
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    overflow: "hidden",
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    flex: 1,
  },
  form: {
    borderBottomWidth: 0,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.color_text_base,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: theme.color_text_secondary,
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: theme.border_color_base,
    borderWidth: 1,
  },
  inputTextStyle: {
    fontSize: 16,
    fontWeight: "300",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: theme.link_button_color,
    fontSize: 14,
    fontWeight: "500",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#999999",
    fontSize: 14,
    fontWeight: "500",
  },
  googleContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  placeholderText: {
    color: "#999999",
    fontSize: 14,
  },
  registerContainer: {
    paddingTop: 16,
  },
  registerText: {
    fontSize: 15,
    color: "#666666",
  },
  registerLink: {
    fontSize: 15,
    color: theme.link_button_color,
    fontWeight: "600",
  },
  labelStyle: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: theme.color_text_base,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
