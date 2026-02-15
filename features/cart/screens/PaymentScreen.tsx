import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { cartService } from '../services/cartService';
import { PaymentLinkResponse } from '../types';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { logger } from '@/utils/logger';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal } from 'react-native';
import QRCode from "react-native-qrcode-svg";
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function PaymentScreen() {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Expect payment data from route params
    const { checkoutUrl, orderCode } = route.params || {};

    const [paymentData, setPaymentData] = useState<PaymentLinkResponse | null>(null);

    useEffect(() => {
        if (checkoutUrl && orderCode) {
            setPaymentData({
                checkoutUrl,
                orderCode,
                paymentLinkId: orderCode
            });
        } else {
            Alert.alert("Error", "Invalid payment data");
            navigation.goBack();
        }
    }, [checkoutUrl, orderCode]);

    const checkPaymentStatus = async () => {
        if (!orderCode) return;

        try {
            const response = await cartService.verifyPayment(orderCode);
            if (response.success) {
                // Assuming backend returns success=true if payment is confirmed
                // Could be response.data.status === 'PAID' or similar
                Alert.alert("Payment Successful", "Your order has been paid successfully.", [
                    { text: "OK", onPress: () => navigation.replace('TransactionHistory') }
                ]);
            } else {
                Alert.alert("Payment Incomplete", "We could not verify your payment. Please check your transaction history.", [
                    { text: "Check History", onPress: () => navigation.replace('TransactionHistory') }
                ]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to verify payment status.", [
                { text: "OK", onPress: () => navigation.replace('TransactionHistory') }
            ]);
        }
    };

    const handleNavigationStateChange = (navState: any) => {
        // Check for PayOS success/cancel callback URLs
        // Adjust these strings based on your actual Return URL configuration in PayOS
        if (navState.url.includes('success') || navState.url.includes('cancel') || navState.url.includes('status=')) {
            // If we detect a return URL, we check the status immediately
            checkPaymentStatus();
        }
    };

    const handleClose = () => {
        // When user manually closes, we should also check status in case they paid but didn't get redirected
        Alert.alert(
            "Cancel Payment?",
            "Are you sure you want to close? We will verify your payment status.",
            [
                { text: "Keep Paying", style: "cancel" },
                { text: "Close & Verify", onPress: checkPaymentStatus }
            ]
        );
    };



    if (!paymentData) return <LoadingOverlay visible={true} message="Loading payment info..." />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.border || '#e5e5e5',
                justifyContent: 'space-between'
            }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.foreground }}>Payment</Text>
                <TouchableOpacity onPress={handleClose} style={{ padding: 5 }}>
                    <MaterialIcons name="close" size={26} color={theme.foreground} />
                </TouchableOpacity>
            </View>

            {paymentData?.checkoutUrl && (
                <WebView
                    source={{ uri: paymentData.checkoutUrl }}
                    style={{ flex: 1 }}
                    startInLoadingState
                    renderLoading={() => <LoadingOverlay visible={true} />}
                    onNavigationStateChange={handleNavigationStateChange}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
});
