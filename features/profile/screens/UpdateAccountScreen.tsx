import { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { userService, UpdateAccountData } from "../services/userService";

export default function UpdateAccountScreen() {
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [fullName, setFullName] = useState(user?.fullname || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (phoneNumber && !/^\+?[\d\s-]{10,}$/.test(phoneNumber.replace(/\s/g, ""))) {
            newErrors.phoneNumber = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const updateData: UpdateAccountData = {
                fullname: fullName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim() || undefined,
            };

            const response = await userService.updateAccount(updateData);
            
            if (response.status === 200 && response.data) {
                updateUser(response.data);
                Alert.alert("Success", response.message || "Account updated successfully", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", response.message || "Failed to update account");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
            edges={["top"]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.foreground} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold" style={{ color: theme.foreground }}>
                        Edit Profile
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <Ionicons name="person" size={48} color={theme.primaryForeground} />
                        </View>
                        <TouchableOpacity style={[styles.changePhotoButton, { borderColor: theme.border }]}>
                            <Ionicons name="camera-outline" size={16} color={theme.primary} />
                            <Text className="text-sm ml-2" style={{ color: theme.primary }}>
                                Change Photo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text className="text-sm font-medium mb-2" style={{ color: theme.foreground }}>
                                Full Name
                            </Text>
                            <Input
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    if (errors.fullName) {
                                        setErrors((prev) => ({ ...prev, fullName: "" }));
                                    }
                                }}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.mutedForeground}
                                style={[
                                    styles.input,
                                    { 
                                        borderColor: errors.fullName ? theme.destructive : theme.border,
                                        backgroundColor: theme.background,
                                        color: theme.foreground,
                                    }
                                ]}
                                autoCapitalize="words"
                            />
                            {errors.fullName && (
                                <Text className="text-sm mt-1" style={{ color: theme.destructive }}>
                                    {errors.fullName}
                                </Text>
                            )}
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text className="text-sm font-medium mb-2" style={{ color: theme.foreground }}>
                                Email
                            </Text>
                            <Input
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) {
                                        setErrors((prev) => ({ ...prev, email: "" }));
                                    }
                                }}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.mutedForeground}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                style={[
                                    styles.input,
                                    { 
                                        borderColor: errors.email ? theme.destructive : theme.border,
                                        backgroundColor: theme.background,
                                        color: theme.foreground,
                                    }
                                ]}
                            />
                            {errors.email && (
                                <Text className="text-sm mt-1" style={{ color: theme.destructive }}>
                                    {errors.email}
                                </Text>
                            )}
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputGroup}>
                            <Text className="text-sm font-medium mb-2" style={{ color: theme.foreground }}>
                                Phone Number
                                <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                                    {" "}(optional)
                                </Text>
                            </Text>
                            <Input
                                value={phoneNumber}
                                onChangeText={(text) => {
                                    setPhoneNumber(text);
                                    if (errors.phoneNumber) {
                                        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                                    }
                                }}
                                placeholder="Enter your phone number"
                                placeholderTextColor={theme.mutedForeground}
                                keyboardType="phone-pad"
                                style={[
                                    styles.input,
                                    { 
                                        borderColor: errors.phoneNumber ? theme.destructive : theme.border,
                                        backgroundColor: theme.background,
                                        color: theme.foreground,
                                    }
                                ]}
                            />
                            {errors.phoneNumber && (
                                <Text className="text-sm mt-1" style={{ color: theme.destructive }}>
                                    {errors.phoneNumber}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* User ID (read-only info) */}
                    <View style={[styles.infoCard, { backgroundColor: theme.muted, borderColor: theme.border }]}>
                        <View style={styles.infoRow}>
                            <Ionicons name="finger-print-outline" size={18} color={theme.mutedForeground} />
                            <Text className="text-sm ml-2" style={{ color: theme.mutedForeground }}>
                                User ID: {user?.id || "N/A"}
                            </Text>
                        </View>
                        {user?.isVerified !== undefined && (
                            <View style={styles.infoRow}>
                                <Ionicons 
                                    name={user.isVerified ? "checkmark-circle" : "close-circle"} 
                                    size={18} 
                                    color={user.isVerified ? theme.primary : theme.destructive} 
                                />
                                <Text className="text-sm ml-2" style={{ color: theme.mutedForeground }}>
                                    {user.isVerified ? "Verified Account" : "Unverified Account"}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Save Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            onPress={handleSave}
                            disabled={isLoading}
                            style={[
                                styles.saveButton,
                                { backgroundColor: theme.primary },
                                isLoading && { opacity: 0.7 }
                            ]}
                        >
                            <Text className="text-base font-semibold" style={{ color: theme.primaryForeground }}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Text>
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerSpacer: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    changePhotoButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    formCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        borderRadius: 8,
        borderWidth: 1,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    saveButton: {
        height: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
});
