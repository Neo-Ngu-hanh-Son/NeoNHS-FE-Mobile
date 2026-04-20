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
import { useTranslation } from "react-i18next";

type EnterOtpScreenProps = StackScreenProps<AuthStackParamList, "EnterOtp">;

export default function EnterOtpScreen({ navigation, route }: EnterOtpScreenProps) {
    const email = route.params?.email || "";
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { t } = useTranslation();

    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateOtp = (value: string) => {
        if (!value.trim()) {
            return t("auth.validation.otp_required");
        }
        if (value.trim().length < 4) {
            return t("auth.validation.otp_invalid");
        }
        return "";
    };

    const handleVerifyOtp = async () => {
        const otpErr = validateOtp(otp);
        setOtpError(otpErr);
        if (otpErr) return;
        setIsLoading(true);
        try {
            await authService.verifyOtp(email, otp.trim());
            navigation.navigate("ForgotPasswordOtp", { email });
        } catch (error) {
            Alert.alert(
                t("auth.alert.verification_failed_title"),
                (error as Error).message || t("auth.alert.verification_failed_message")
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
                    <Text style={[styles.title, { color: theme.foreground }]}>{t("auth.otp_verification")}</Text>
                    <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>{t("auth.enter_code_from_email")}</Text>
                </View>
                {/* OTP Input */}
                <View style={styles.inputGroup}>
                    <Label style={styles.label}>{t("auth.form.otp_label")}</Label>
                    <Input
                        placeholder={t("auth.form.otp_placeholder")}
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
                        {t("auth.button.verify_otp")}
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
