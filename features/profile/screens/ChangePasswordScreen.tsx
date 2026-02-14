import { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { userService } from '../services/userService';
import { ApiError } from '@/services/api/types';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!oldPassword) {
            newErrors.oldPassword = 'Current password is required';
        }

        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!confirmNewPassword) {
            newErrors.confirmNewPassword = 'Please confirm your new password';
        } else if (confirmNewPassword !== newPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await userService.changePassword({
                oldPassword,
                newPassword,
                confirmNewPassword,
            });

            if (response.success) {
                Alert.alert('Success', 'Password changed successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            const apiError = error as ApiError;
            Alert.alert('Error', apiError.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.primary }]}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}>
                            <Text className="mb-6 text-2xl font-bold" style={{ color: theme.foreground }}>
                                Change Password
                            </Text>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.foreground }]}>Current Password</Text>
                                    <Input
                                        value={oldPassword}
                                        onChangeText={(text) => {
                                            setOldPassword(text);
                                            if (errors.oldPassword) setErrors((prev) => ({ ...prev, oldPassword: '' }));
                                        }}
                                        placeholder="Enter current password"
                                        secureTextEntry
                                        style={[
                                            styles.inputCustom,
                                            { borderColor: errors.oldPassword ? theme.destructive : theme.border },
                                        ]}
                                    />
                                    {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.foreground }]}>New Password</Text>
                                    <Input
                                        value={newPassword}
                                        onChangeText={(text) => {
                                            setNewPassword(text);
                                            if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                                        }}
                                        placeholder="Enter new password"
                                        secureTextEntry
                                        style={[
                                            styles.inputCustom,
                                            { borderColor: errors.newPassword ? theme.destructive : theme.border },
                                        ]}
                                    />
                                    {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.foreground }]}>Confirm New Password</Text>
                                    <Input
                                        value={confirmNewPassword}
                                        onChangeText={(text) => {
                                            setConfirmNewPassword(text);
                                            if (errors.confirmNewPassword) setErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
                                        }}
                                        placeholder="Confirm new password"
                                        secureTextEntry
                                        style={[
                                            styles.inputCustom,
                                            { borderColor: errors.confirmNewPassword ? theme.destructive : theme.border },
                                        ]}
                                    />
                                    {errors.confirmNewPassword && <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>}
                                </View>
                            </View>

                            <View style={styles.buttonWrapper}>
                                <Button
                                    onPress={handleChangePassword}
                                    disabled={isLoading}
                                    style={[
                                        styles.saveButton,
                                        { backgroundColor: theme.foreground },
                                        isLoading && { opacity: 0.7 },
                                    ]}>
                                    <Text style={{ color: theme.background, fontWeight: '700', fontSize: 16 }}>
                                        {isLoading ? 'Changing...' : 'Change Password'}
                                    </Text>
                                </Button>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { height: 60, justifyContent: 'center', paddingHorizontal: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center' },
    backText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 4 },
    mainContent: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 30 },
    keyboardView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { gap: 20 },
    inputGroup: { marginBottom: 5 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    inputCustom: { height: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: 16 },
    errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
    buttonWrapper: { marginTop: 40 },
    saveButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
