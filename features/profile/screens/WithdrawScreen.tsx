import { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { userService } from '../services/userService';
import { ApiError } from '@/services/api/types';

export default function WithdrawScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [balance, setBalance] = useState<number>(0);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        bankAccountNumber: '',
        bankAccountName: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile();
            if (response.success && response.data) {
                setBalance(response.data.balance || 0);
                setBankInfo({
                    bankName: response.data.bankName || '',
                    bankAccountNumber: response.data.bankAccountNumber || '',
                    bankAccountName: response.data.bankAccountName || '',
                });
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
    };

    const handleWithdraw = async () => {
        const withdrawAmount = parseInt(amount, 10);

        if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
            return;
        }

        if (withdrawAmount > balance) {
            Alert.alert('Insufficient Balance', `Your balance is ${formatCurrency(balance)}. You cannot withdraw more than that.`);
            return;
        }

        if (!bankInfo.bankAccountNumber) {
            Alert.alert('No Bank Account', 'Please update your bank account information in your profile first.');
            return;
        }

        Alert.alert(
            'Confirm Withdrawal',
            `Withdraw ${formatCurrency(withdrawAmount)} to:\n\n` +
            `Bank: ${bankInfo.bankName}\n` +
            `Account: ${bankInfo.bankAccountNumber}\n` +
            `Name: ${bankInfo.bankAccountName}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const response = await userService.withdraw(withdrawAmount);
                            if (response.success) {
                                Alert.alert('Success', `Successfully withdrew ${formatCurrency(withdrawAmount)}`, [
                                    { text: 'OK', onPress: () => navigation.goBack() },
                                ]);
                            }
                        } catch (error) {
                            const apiError = error as ApiError;
                            Alert.alert('Withdrawal Failed', apiError.message || 'An error occurred while processing your withdrawal.');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const quickAmounts = [50000, 100000, 200000, 500000];

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
                    {isFetching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}>
                            <View style={styles.scrollContent}>
                                <Text className="mb-2 text-2xl font-bold" style={{ color: theme.foreground }}>
                                    Withdraw Money
                                </Text>
                                <Text className="mb-6 text-sm" style={{ color: theme.mutedForeground }}>
                                    Transfer your balance to your linked bank account
                                </Text>

                                {/* Balance Card */}
                                <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
                                    <View style={styles.balanceHeader}>
                                        <MaterialIcons name="account-balance-wallet" size={24} color="white" />
                                        <Text style={styles.balanceLabel}>Available Balance</Text>
                                    </View>
                                    <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
                                </View>

                                {/* Bank Info Card */}
                                {bankInfo.bankAccountNumber ? (
                                    <View style={[styles.bankCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                        <View style={styles.bankCardHeader}>
                                            <MaterialIcons name="account-balance" size={20} color={theme.primary} />
                                            <Text style={[styles.bankCardTitle, { color: theme.foreground }]}>Bank Account</Text>
                                        </View>
                                        <Text style={[styles.bankDetail, { color: theme.mutedForeground }]}>
                                            {bankInfo.bankName} • {bankInfo.bankAccountNumber}
                                        </Text>
                                        <Text style={[styles.bankDetail, { color: theme.foreground, fontWeight: '600' }]}>
                                            {bankInfo.bankAccountName}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={[styles.bankCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                                        <View style={styles.bankCardHeader}>
                                            <MaterialIcons name="warning" size={20} color="#F59E0B" />
                                            <Text style={[styles.bankCardTitle, { color: '#92400E' }]}>No Bank Account</Text>
                                        </View>
                                        <Text style={{ color: '#92400E', fontSize: 13 }}>
                                            Please update your bank info in Edit Profile first.
                                        </Text>
                                    </View>
                                )}

                                {/* Amount Input */}
                                <View style={styles.inputSection}>
                                    <Text style={[styles.label, { color: theme.foreground }]}>Withdrawal Amount (VND)</Text>
                                    <Input
                                        value={amount}
                                        onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
                                        placeholder="Enter amount"
                                        keyboardType="numeric"
                                        style={[styles.amountInput, { borderColor: theme.border, fontSize: 20, fontWeight: '700' }]}
                                    />
                                </View>

                                {/* Quick Amount Buttons */}
                                <View style={styles.quickAmountRow}>
                                    {quickAmounts.map((qa) => (
                                        <TouchableOpacity
                                            key={qa}
                                            style={[
                                                styles.quickAmountBtn,
                                                {
                                                    borderColor: amount === String(qa) ? theme.primary : theme.border,
                                                    backgroundColor: amount === String(qa) ? theme.primary + '15' : theme.card,
                                                },
                                            ]}
                                            onPress={() => setAmount(String(qa))}>
                                            <Text
                                                style={{
                                                    color: amount === String(qa) ? theme.primary : theme.mutedForeground,
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                }}>
                                                {new Intl.NumberFormat('vi-VN').format(qa)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Withdraw Button */}
                                <Button
                                    onPress={handleWithdraw}
                                    disabled={isLoading || !amount || !bankInfo.bankAccountNumber}
                                    style={[
                                        styles.withdrawButton,
                                        { backgroundColor: theme.primary },
                                        (isLoading || !amount || !bankInfo.bankAccountNumber) && { opacity: 0.5 },
                                    ]}>
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <MaterialIcons name="send" size={20} color="white" />
                                            <Text style={styles.buttonText}>
                                                {amount ? `Withdraw ${formatCurrency(parseInt(amount, 10) || 0)}` : 'Withdraw'}
                                            </Text>
                                        </View>
                                    )}
                                </Button>
                            </View>
                        </KeyboardAvoidingView>
                    )}
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    balanceCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: '500',
    },
    balanceAmount: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
    },

    bankCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    bankCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    bankCardTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    bankDetail: {
        fontSize: 13,
        marginTop: 2,
    },

    inputSection: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    amountInput: {
        height: 60,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        textAlign: 'center',
    },

    quickAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 28,
    },
    quickAmountBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },

    withdrawButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});
