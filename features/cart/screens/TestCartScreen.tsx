import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { cartService } from '../services/cartService';
import { Cart, CartItem, PreCheckoutResponse, PaymentLinkResponse, Voucher } from '../types';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import QRCode from "react-native-qrcode-svg";
import { logger } from '@/utils/logger';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, Modal } from 'react-native';

export default function TestCartScreen() {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<Cart | null>(null);
    const [preCheckoutData, setPreCheckoutData] = useState<PreCheckoutResponse | null>(null);
    const [paymentLinkData, setPaymentLinkData] = useState<PaymentLinkResponse | null>(null);


    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [loadingVouchers, setLoadingVouchers] = useState(false);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await cartService.getCart();
            if (response.success && response.data) {
                setCart(response.data);
                logger.info("Cart fetched successfully", response.data);
            } else {
                Alert.alert("Error", response.message || "Failed to fetch cart");
            }
        } catch (error: any) {
            logger.error("Fetch cart error", error);
            Alert.alert("Error", error.message || "Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    };

    const fetchVouchers = async () => {
        setLoadingVouchers(true);
        try {
            const response = await cartService.getVouchers();
            if (response.success && response.data) {
                setVouchers(response.data);
            } else {
                Alert.alert("Error", response.message || "Failed to fetch vouchers");
            }
        } catch (error: any) {
            logger.error("Fetch vouchers error", error);
            Alert.alert("Error", error.message || "Failed to fetch vouchers");
        } finally {
            setLoadingVouchers(false);
        }
    };

    const handlePreCheckout = async () => {
        if (!cart || cart.items.length === 0) {
            Alert.alert("Error", "Cart is empty");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cartItemIds: cart.items.map(item => item.id),
                voucherIds: selectedVoucher ? [selectedVoucher.userVoucherId] : []
            };

            const response = await cartService.preCheckout(payload);
            if (response.success && response.data) {
                setPreCheckoutData(response.data);
                logger.info("Pre-checkout successful", response.data);
            } else {
                Alert.alert("Error", response.message || "Pre-checkout failed");
            }
        } catch (error: any) {
            logger.error("Pre-checkout error", error);
            Alert.alert("Error", error.message || "Pre-checkout failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePaymentLink = async () => {
        if (!preCheckoutData) {
            Alert.alert("Error", "Please perform pre-checkout first");
            return;
        }

        setLoading(true);
        try {
            // Using IDs from the pre-checkout data (which matches the cart items)
            const cartItemIds = preCheckoutData.cartItems.map(item => item.id);
            const voucherIds = selectedVoucher ? [selectedVoucher.userVoucherId] : [];

            const payload = {
                cartItemIds,
                voucherIds
            };

            const response = await cartService.createPaymentLink(payload);
            if (response.success && response.data) {
                setPaymentLinkData(response.data);
                logger.info("Payment link created", response.data);
            } else {
                Alert.alert("Error", response.message || "Failed to create payment link");
            }
        } catch (error: any) {
            logger.error("Create payment link error", error);
            Alert.alert("Error", error.message || "Failed to create payment link");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPaymentLink = () => {
        if (paymentLinkData?.checkoutUrl) {
            Linking.openURL(paymentLinkData.checkoutUrl);
        }
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.itemName, { color: theme.foreground }]}>{item.itemName}</Text>
            <View style={styles.row}>
                <Text style={{ color: theme.mutedForeground }}>Price:</Text>
                <Text style={{ color: theme.foreground }}>{item.price.toLocaleString()} VND</Text>
            </View>
            <View style={styles.row}>
                <Text style={{ color: theme.mutedForeground }}>Quantity:</Text>
                <Text style={{ color: theme.foreground }}>{item.quantity}</Text>
            </View>
            <View style={styles.row}>
                <Text style={{ color: theme.mutedForeground }}>Total:</Text>
                <Text style={{ color: theme.foreground }}>{item.totalPrice.toLocaleString()} VND</Text>
            </View>
        </View>
    );

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.foreground }]}>Shopping Cart Test</Text>

                {/* Cart Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>1. Cart Items</Text>
                        <Button size="sm" variant="outline" onPress={fetchCart}>
                            <Text>Refresh</Text>
                        </Button>
                    </View>

                    {cart ? (
                        <>
                            {cart.items.map(item => <View key={item.id}>{renderCartItem({ item })}</View>)}
                            <View style={[styles.summary, { backgroundColor: theme.muted }]}>
                                <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>
                                    Total Items: {cart.totalItems}
                                </Text>
                                <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>
                                    Total Price: {cart.totalPrice.toLocaleString()} VND
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text style={{ color: theme.mutedForeground }}>No cart data loaded</Text>
                    )}
                </View>

                {/* Pre-checkout Section */}
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.foreground }]}>2. Pre-Checkout</Text>

                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ color: theme.foreground, marginBottom: 8 }}>Select Voucher:</Text>
                        <TouchableOpacity
                            onPress={() => {
                                fetchVouchers();
                                setShowVoucherModal(true);
                            }}
                            style={{
                                padding: 12,
                                borderWidth: 1,
                                borderColor: theme.border || '#e5e5e5',
                                borderRadius: 8,
                                backgroundColor: theme.card,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: selectedVoucher ? theme.primary : theme.mutedForeground }}>
                                {selectedVoucher ? `${selectedVoucher.code} (-${selectedVoucher.discountValue.toLocaleString()} VND)` : "Select a voucher"}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={theme.foreground} />
                        </TouchableOpacity>
                        {selectedVoucher && (
                            <TouchableOpacity onPress={() => setSelectedVoucher(null)} style={{ marginTop: 4 }}>
                                <Text style={{ color: 'red', fontSize: 12 }}>Remove Voucher</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Button onPress={handlePreCheckout} className="mb-4">
                        <Text style={{ color: 'white' }}>Calculate Total (Pre-Checkout)</Text>
                    </Button>

                    <Modal
                        visible={showVoucherModal}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setShowVoucherModal(false)}
                    >
                        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <View style={{ backgroundColor: theme.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.foreground }}>Select Voucher</Text>
                                    <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                                        <MaterialIcons name="close" size={24} color={theme.foreground} />
                                    </TouchableOpacity>
                                </View>

                                {loadingVouchers ? (
                                    <Text style={{ color: theme.foreground, textAlign: 'center', padding: 20 }}>Loading vouchers...</Text>
                                ) : (
                                    <FlatList
                                        data={vouchers}
                                        keyExtractor={(item) => item.userVoucherId}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={{
                                                    padding: 16,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: theme.border,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                                onPress={() => {
                                                    setSelectedVoucher(item);
                                                    setShowVoucherModal(false);
                                                }}
                                            >
                                                <View>
                                                    <Text style={{ fontWeight: 'bold', color: theme.foreground }}>{item.code}</Text>
                                                    <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>Min Order: {item.minOrderValue.toLocaleString()} VND</Text>
                                                </View>
                                                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>-{item.discountValue.toLocaleString()} VND</Text>
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: theme.mutedForeground }}>No vouchers found</Text>}
                                    />
                                )}
                            </View>
                        </View>
                    </Modal>

                    {preCheckoutData && (
                        <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                            <Text style={[styles.resultTitle, { color: theme.primary }]}>Pre-Checkout Summary</Text>
                            <View style={styles.row}>
                                <Text style={{ color: theme.mutedForeground }}>Original Total:</Text>
                                <Text style={{ color: theme.foreground }}>{preCheckoutData.totalPrice.toLocaleString()} VND</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={{ color: theme.mutedForeground }}>Discount:</Text>
                                <Text style={{ color: '#22c55e' }}>-{preCheckoutData.discountValue.toLocaleString()} VND</Text>
                            </View>
                            <View style={[styles.row, { marginTop: 8, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8 }]}>
                                <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>Final Total:</Text>
                                <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>{preCheckoutData.finalTotalPrice.toLocaleString()} VND</Text>
                            </View>
                            {preCheckoutData.appliedVoucher && (
                                <Text style={{ color: '#22c55e', fontSize: 12, marginTop: 4 }}>
                                    Applied Voucher: {preCheckoutData.appliedVoucher.code} (-{preCheckoutData.appliedVoucher.discountValue.toLocaleString()})
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Payment Section */}
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.foreground }]}>3. Payment (PayOS)</Text>
                    <Button
                        onPress={handleCreatePaymentLink}
                        disabled={!preCheckoutData}
                        className="mb-4"
                        style={{ opacity: !preCheckoutData ? 0.5 : 1 }}
                    >
                        <Text style={{ color: 'white' }}>Create Payment Link</Text>
                    </Button>

                    {paymentLinkData && (
                        <View style={[styles.paymentCard, { backgroundColor: 'white' }]}>
                            <Text style={{ color: 'black', marginBottom: 12, fontWeight: 'bold', textAlign: 'center' }}>
                                Scan to Pay
                            </Text>
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <QRCode value={paymentLinkData.checkoutUrl} size={200} />
                            </View>
                            <Button onPress={handleOpenPaymentLink} variant="outline">
                                <Text>Open Payment Link</Text>
                            </Button>
                            <Text style={{ color: '#64748b', fontSize: 10, marginTop: 8, textAlign: 'center' }}>
                                Order Code: {paymentLinkData.orderCode}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
            <LoadingOverlay visible={loading} message="Processing..." />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summary: {
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    resultCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    paymentCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
});
