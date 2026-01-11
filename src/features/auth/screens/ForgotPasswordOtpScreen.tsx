import { View, Text, StyleSheet, Alert } from "react-native";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { theme } from "@/theme/colors";
import { Form, Input, WhiteSpace, Button, Flex } from "@ant-design/react-native";
import { useForm } from "@ant-design/react-native/lib/form/Form";
import { useState } from "react";
import { logger } from "@/utils/logger";
import AppLink from "@/components/Navigator/AppLink";
import { authService } from "../services/authService";
import { StackScreenProps } from "@react-navigation/stack";
import { AuthStackParamList } from "@/app/navigations/NavigationParamTypes";

type ForgotPasswordOtpScreenProps = StackScreenProps<AuthStackParamList, "ForgotPasswordOtp">;
export default function ForgotPasswordOtpScreen({
  navigation,
  route,
}: ForgotPasswordOtpScreenProps) {
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const handleFormSubmit = () => {
    form.submit();
  };

  const handleOtpConfirm = async ({ otp, new_password }: { otp: string; new_password: string }) => {
    setLoading(true);
    try {
      const resp = await authService.resetPassword(otp, new_password);
      if (resp.status === 200) {
        Alert.alert(
          "Success",
          "Your password has been reset, please login with your new password.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.replace("Login");
              },
            },
          ]
        );
      } else {
        // Validation purposes from backend
        throw new Error(resp.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert("An error occurred", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout isLoading={loading}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Reset password OTP</Text>
          <Text style={styles.formSubtitle}>
            Please enter the OTP sent to your email address to reset your password.
          </Text>

          <WhiteSpace size="lg" />

          <Form onFinish={handleOtpConfirm} layout="vertical" form={form}>
            <Form.Item
              name="otp"
              label="OTP"
              rules={[
                { required: true, message: "Please enter the OTP" },
                { type: "string", message: "Please enter a valid OTP" },
              ]}
              labelStyle={styles.labelStyle}
            >
              <Input
                placeholder="Enter your OTP"
                type="default"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                style={styles.input}
                inputStyle={styles.inputTextStyle}
              />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="New Password"
              rules={[
                { required: true, message: "Please enter the new password" },
                { type: "string", message: "Please enter a valid password" },
              ]}
              labelStyle={styles.labelStyle}
            >
              <Input
                placeholder="Enter your new password"
                type="password"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                style={styles.input}
                inputStyle={styles.inputTextStyle}
              />
            </Form.Item>

            <WhiteSpace size="lg" />

            <Button type="primary" onPress={handleFormSubmit}>
              <Text style={{ textAlign: "center", color: "white" }}>Confirm OTP</Text>
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
