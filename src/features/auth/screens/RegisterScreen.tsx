import { Button, Flex, Form, Input, Text, View, WhiteSpace } from "@ant-design/react-native";
import { useAuth } from "../context/AuthContext";
import { logger } from "@/utils/logger";
import { CompositeScreenProps, Link } from "@react-navigation/native";
import { useForm } from "@ant-design/react-native/lib/form/Form";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "@/theme/colors";
import { IconButton } from "@/components/Buttons/IconButton";
import AuthLayout from "../components/AuthLayout";
import AppLink from "@/components/Navigator/AppLink";
import { StackScreenProps } from "@react-navigation/stack";
import { AuthStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";

type RegisterScreenProps = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, "Register">,
  StackScreenProps<RootStackParamList>
>;
export default function RegisterScreen({ navigation, route }: RegisterScreenProps) {
  const { register, isLoading } = useAuth();
  const [form] = useForm();

  const onSubmit = () => {
    form.submit();
  };

  const handleRegister = async (values: { name: string; email: string; password: string }) => {
    try {
      await register(values);
      // Navigate to main app (because user info is already in auth context after registration)
      navigation.replace("Main", {
        screen: "Tabs",
        params: { screen: "Home" },
      });
    } catch (error) {
      logger.error(error);
      Alert.alert("Registration Error", "An error occurred during registration. Please try again.");
    }
  };

  return (
    <>
      <AuthLayout isLoading={isLoading}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Sign up to get started</Text>

          <WhiteSpace size="lg" />

          <Form onFinish={handleRegister} layout="vertical" form={form} style={styles.form}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
              labelStyle={styles.labelStyle}
            >
              <Input
                placeholder="Enter your name"
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
                inputStyle={styles.inputTextStyle}
              />
            </Form.Item>

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
            >
              <Input
                type="password"
                placeholder="Enter your password"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                inputStyle={styles.inputTextStyle}
              />
            </Form.Item>

            <WhiteSpace size="lg" />

            <Button type="primary" onPress={onSubmit} style={styles.signUpButton}>
              <Text style={styles.signUpButtonText}>Sign up</Text>
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
                borderColor: "grey",
              }}
            />
          </View>

          <WhiteSpace size="lg" />

          <Flex justify="center" align="center" style={styles.loginContainer}>
            <Text style={styles.loginText}>Have an account? </Text>
            <TouchableOpacity>
              <AppLink screen="Login" params={{}}>
                Sign in
              </AppLink>
            </TouchableOpacity>
          </Flex>
        </View>
      </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
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
  signUpButton: {
    height: 48,
    borderRadius: 12,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  loginContainer: {
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 15,
    color: "#666666",
  },
  loginLink: {
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
});
