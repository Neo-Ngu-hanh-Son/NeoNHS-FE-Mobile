import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { AuthStackParamList } from "@/app/navigations/NavigationParamTypes";
import { authService } from "../services/authService";
import AuthLayout from "../components/AuthLayout";

// Thêm màn hình nhập OTP

type EnterOtpScreenProps = StackScreenProps<AuthStackParamList, "EnterOtp">;

export default function EnterOtpScreen({ navigation, route }: EnterOtpScreenProps) {
    const email = route.params?.email || "";
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateOtp = (value: string) => {
        if (!value.trim()) {
            return "OTP code is required";
        }
        if (value.trim().length < 4) {
            return "Please enter a valid OTP code";
        }
        return "";
    };

    const handleVerifyOtp = async () => {
        const otpErr = validateOtp(otp);
        setOtpError(otpErr);
        if (otpErr) return;
        setIsLoading(true);
        try {
            // Gọi API verify OTP
            await authService.verifyOtp(email, otp.trim());
            // Nếu thành công, chuyển sang màn nhập mật khẩu mới, chỉ truyền email
            navigation.navigate("ForgotPasswordOtp", { email });
        } catch (error) {
            Alert.alert(
                "Verification Failed",
                (error as Error).message || "Unable to verify code. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout isLoading={isLoading}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.foreground }]}>OTP Verification</Text>
                    <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>Please enter a code from email</Text>
                </View>
                {/* OTP Input */}
                <View style={styles.inputGroup}>
                    <Label style={styles.label}>Your code</Label>
                    <Input
                        placeholder="Enter code"
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={otp}
                        onChangeText={(text) => {
                            setOtp(text);
                            if (otpError) setOtpError("");
                        }}
                        className={otpError ? "border-destructive" : ""}
                    />
                    {otpError ? (
                        <Text style={[styles.errorText, { color: theme.destructive }]}>{otpError}</Text>
                    ) : null}
                </View>
                {/* Verify Button */}
                <Button
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                    size="lg"
                    className="mt-4"
                >
                    <Text className="text-primary-foreground font-semibold text-base">
                        Verification
                    </Text>
                </Button>
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
        marginBottom: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    inputGroup: {
        gap: 8,
        marginBottom: 16,
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
