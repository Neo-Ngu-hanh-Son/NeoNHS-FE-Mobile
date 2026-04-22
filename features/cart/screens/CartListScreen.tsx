import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { cartService } from '../services/cartService';
import { Cart, CartItem, Voucher } from '../types';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { logger } from '@/utils/logger';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function CartListScreen() {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<Cart | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Format discount value based on type
    const formatDiscount = (voucher: Voucher): string => {
        if (voucher.discountType === 'PERCENT') {
            return `-${voucher.discountValue}%`;
        }
        return `-${voucher.discountValue.toLocaleString()} VND`;
    };

    // Applicable product label + color
    const getApplicableLabel = (ap: Voucher['applicableProduct']) => {
        switch (ap) {
            case 'EVENT_TICKET': return { label: 'Event Ticket', color: '#3b82f6' };
            case 'WORKSHOP': return { label: 'Workshop', color: '#a855f7' };
            case 'TICKET': return { label: 'Ticket', color: '#f59e0b' };
            default: return { label: 'All Items', color: '#22c55e' };
        }
    };

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

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const validSelectedItems = cart?.items ? cart.items.filter(item => selectedItems.has(item.id)) : [];
    const validSelectedCount = validSelectedItems.length;

    const handleProceedToPreCheckout = () => {
        if (validSelectedCount === 0) {
            Alert.alert("Selection Required", "Please select at least one item to proceed.");
            return;
        }
        const selectedIds = validSelectedItems.map(item => item.id);
        navigation.navigate('PreCheckout', {
            selectedIds,
            selectedVoucherId: selectedVoucher?.userVoucherId
        });
    };
    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        // 1. Optimistic Update UI lập tức
        setCart(prevCart => {
            if (!prevCart) return prevCart;

            const updatedItems = prevCart.items.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        quantity: newQuantity,
                        totalPrice: (item.price * newQuantity)
                    };
                }
                return item;
            });

            return { ...prevCart, items: updatedItems };
        });

        // 2. Clear timer cũ (Debounce)
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // 3. Gọi ngầm API sau độ trễ 500ms
        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await cartService.updateCartItem(itemId, newQuantity);
                if (!response.success) {
                    Alert.alert("Error", response.message || "Failed to update quantity");
                    fetchCart(); // Gọi lại giỏ hàng từ server nếu lỗi để Rollback dữ liệu
                }
            } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to update quantity");
                fetchCart(); // Rollback dữ liệu
            }
        }, 500);
    };

    const handleRemoveItem = (itemId: string) => {
        Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this item from your cart?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        // 1. Cập nhật UI ngay lập tức
                        setCart(prevCart => {
                            if (!prevCart) return prevCart;
                            const remainingItems = prevCart.items.filter(item => item.id !== itemId);
                            return { ...prevCart, items: remainingItems };
                        });

                        // Xóa khỏi selectedItems nếu đã được chọn
                        if (selectedItems.has(itemId)) {
                            const newSelection = new Set(selectedItems);
                            newSelection.delete(itemId);
                            setSelectedItems(newSelection);
                        }

                        // 2. Chạy ngầm API
                        try {
                            const response = await cartService.removeCartItem(itemId);
                            if (!response.success) {
                                Alert.alert("Error", response.message || "Failed to remove item");
                                fetchCart(); // Rollback lấy lại dữ liệu nếu lỗi
                            }
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to remove item");
                            fetchCart(); // Rollback
                        }
                    }
                }
            ]
        );
    };

    const renderCartItem = ({ item }: { item: CartItem }) => {
        const isSelected = selectedItems.has(item.id);
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1
                    }
                ]}
                onPress={() => toggleSelection(item.id)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.checkbox,
                    {
                        borderColor: isSelected ? theme.primary : theme.mutedForeground,
                        backgroundColor: isSelected ? theme.primary : 'transparent'
                    }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                        <Text style={[styles.itemName, { color: theme.foreground, flex: 1 }]}>{item.itemName}</Text>
                        <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={{ padding: 4 }}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <Text style={{ color: theme.mutedForeground }}>{t('cart.price', 'Price:')}</Text>
                        <Text style={{ color: theme.foreground }}>{item.price.toLocaleString()} VND</Text>
                    </View>

                    <View style={[styles.row, { alignItems: 'center', marginTop: 4 }]}>
                        <Text style={{ color: theme.mutedForeground }}>{t('cart.quantity')}:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 6 }}>
                            <TouchableOpacity
                                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                style={{ padding: 4, paddingHorizontal: 8 }}
                            >
                                <Ionicons name="remove" size={16} color={theme.foreground} />
                            </TouchableOpacity>
                            <Text style={{ color: theme.foreground, paddingHorizontal: 8, fontWeight: 'bold' }}>{item.quantity}</Text>
                            <TouchableOpacity
                                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                style={{ padding: 4, paddingHorizontal: 8 }}
                            >
                                <Ionicons name="add" size={16} color={theme.foreground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.row, { marginTop: 4 }]}>
                        <Text style={{ color: theme.mutedForeground }}>{t('cart.subtotal', 'Total:')}</Text>
                        <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{item.totalPrice.toLocaleString()} VND</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchCart();
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {navigation.canGoBack() && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
                        </TouchableOpacity>
                    )}
                    <Text style={[styles.title, { color: theme.foreground }]}>{t('cart.title')}</Text>
                </View>
                <Button size="sm" variant="outline" onPress={fetchCart}>
                    <Text>{t('common.refresh')}</Text>
                </Button>
            </View>

            <FlatList
                data={cart?.items || []}
                renderItem={renderCartItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.mutedForeground }}>{t('cart.empty')}</Text>
                    </View>
                }
            />

            <Modal
                visible={showVoucherModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowVoucherModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: theme.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%', paddingBottom: 40 }}>
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
                                renderItem={({ item }) => {
                                    const apInfo = getApplicableLabel(item.applicableProduct);
                                    return (
                                        <TouchableOpacity
                                            style={{
                                                padding: 14,
                                                borderBottomWidth: 1,
                                                borderBottomColor: theme.border,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: 12,
                                            }}
                                            onPress={() => {
                                                setSelectedVoucher(item);
                                                setShowVoucherModal(false);
                                            }}
                                        >
                                            {/* Left info */}
                                            <View style={{ flex: 1, gap: 4 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={{ fontWeight: 'bold', color: theme.foreground, fontSize: 15 }}>{item.code}</Text>
                                                    {/* Applicable badge */}
                                                    <View style={{ backgroundColor: apInfo.color + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                        <Text style={{ color: apInfo.color, fontSize: 10, fontWeight: '600' }}>{apInfo.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                                                    {/* <Text style={{ color: theme.mutedForeground, fontSize: 11 }}>
                                                        Min: {item.minOrderValue.toLocaleString()} VND
                                                    </Text> */}
                                                    {item.maxDiscountValue ? (
                                                        <Text style={{ color: theme.mutedForeground, fontSize: 11 }}>
                                                            Max save: {item.maxDiscountValue.toLocaleString()} VND
                                                        </Text>
                                                    ) : null}
                                                    {item.endDate ? (
                                                        <Text style={{ color: '#f59e0b', fontSize: 11 }}>
                                                            Exp: {new Date(item.endDate).toLocaleDateString()}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                            </View>
                                            {/* Discount badge */}
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 16 }}>{formatDiscount(item)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: theme.mutedForeground }}>No vouchers found</Text>}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => {
                        fetchVouchers();
                        setShowVoucherModal(true);
                    }}
                    style={{
                        padding: 12,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: theme.border || '#e5e5e5',
                        borderRadius: 8,
                        backgroundColor: theme.background,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="local-offer" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                        <Text style={{ color: selectedVoucher ? theme.primary : theme.mutedForeground }}>
                            {selectedVoucher ? `${selectedVoucher.code} (${formatDiscount(selectedVoucher)})` : "Select Voucher / Coupon"}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {selectedVoucher && (
                            <TouchableOpacity onPress={() => setSelectedVoucher(null)} style={{ marginRight: 8 }}>
                                <MaterialIcons name="close" size={20} color={theme.mutedForeground} />
                            </TouchableOpacity>
                        )}
                        <MaterialIcons name="chevron-right" size={24} color={theme.mutedForeground} />
                    </View>
                </TouchableOpacity>

                <View style={styles.totalRow}>
                    <Text style={{ color: theme.foreground }}>{t('cart.selected', 'Selected')}: {validSelectedCount}</Text>
                    <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>
                        {t('cart.total')}: {
                            validSelectedItems
                                .reduce((sum, item) => sum + item.totalPrice, 0)
                                .toLocaleString() || 0
                        } VND
                    </Text>
                </View>
                <Button onPress={handleProceedToPreCheckout} disabled={validSelectedCount === 0}>
                    <Text style={{ color: 'white' }}>{t('cart.checkout')}</Text>
                </Button>
            </View>

            <LoadingOverlay visible={loading} message={t('common.loading')} />
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingBottom: 220, // Increased bottom padding to accommodate updated footer
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center', // Changed from flex-start to center for better alignment
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    }
});
