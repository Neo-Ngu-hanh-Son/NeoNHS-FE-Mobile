import { View, Text, StyleSheet, Alert } from "react-native";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { theme } from "@/theme/colors";
import { Form, Input, WhiteSpace, Button, Flex } from "@ant-design/react-native";
import { useForm } from "@ant-design/react-native/lib/form/Form";
import { useState } from "react";
import { logger } from "@/utils/logger";
import { ScreenProps } from "react-native-screens";
import { AuthStackParamList } from "@/app/navigations/NavigationParamTypes";
import { StackScreenProps } from "@react-navigation/stack";
import { Link } from "@react-navigation/native";
import AppLink from "@/components/Navigator/AppLink";
import { authService } from "../services/authService";

type ForgotPasswordScreenProps = StackScreenProps<AuthStackParamList, "ForgotPassword">;
export default function ForgotPasswordScreen({ navigation, route }: ForgotPasswordScreenProps) {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const handleFormSubmit = () => {
    form.submit();
  };

  const handleSendReset = async (values: { email: string }) => {
    setLoading(true);
    try {
      const resp = await authService.forgotPassword(values.email);
      navigation.navigate("ForgotPasswordOtp");
    } catch (error) {
      logger.error("[ForgotPasswordScreen] Error sending password reset:", error);
      Alert.alert(
        "Error",
        "An error occurred while sending the password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout isLoading={loading}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Forgot Password</Text>
          <Text style={styles.formSubtitle}>
            Please enter your email address of your account to receive a password reset link.
          </Text>

          <WhiteSpace size="lg" />

          <Form onFinish={handleSendReset} layout="vertical" form={form}>
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

            <WhiteSpace size="lg" />

            <Button type="primary" onPress={handleFormSubmit}>
              <Text style={{ textAlign: "center", color: "white" }}>Send Reset Link</Text>
            </Button>
          </Form>

          <WhiteSpace size="lg" />
          <WhiteSpace size="lg" />
          <WhiteSpace size="lg" />

          <Flex justify="center" align="center">
            <Text>Already has an account ? </Text>
            <AppLink screen="Login" params={{}}>
              Login
            </AppLink>
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
  labelStyle: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: theme.color_text_base,
  },
});
