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
    // Map: vendorId (or 'platform') → selected Voucher
    const [selectedVouchers, setSelectedVouchers] = useState<Record<string, Voucher>>({});
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    // Which vendor the voucher modal is selecting for
    const [voucherModalTarget, setVoucherModalTarget] = useState<string>('platform');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Format discount value based on type
    const formatDiscount = (voucher: Voucher): string => {
        if (!voucher.discountValue) {
            return t('voucher.gift');
        }
        if (voucher.discountType === 'PERCENT') {
            return `-${voucher.discountValue}%`;
        }
        return `-${(voucher.discountValue ?? 0).toLocaleString()} VND`;
    };

    // Applicable product label + color
    const getApplicableLabel = (ap: Voucher['applicableProduct']) => {
        switch (ap) {
            case 'EVENT_TICKET': return { label: t('cart.event_ticket'), color: '#3b82f6' };
            case 'WORKSHOP': return { label: t('cart.workshop'), color: '#a855f7' };
            case 'TICKET': return { label: t('cart.ticket'), color: '#f59e0b' };
            default: return { label: t('cart.all_items'), color: '#22c55e' };
        }
    };

    // Get unique vendor groups from selected cart items
    const getVendorGroups = () => {
        const items = cart?.items.filter(item => selectedItems.has(item.id)) || [];
        const groups: Record<string, { vendorId: string; vendorName: string; items: CartItem[] }> = {};
        for (const item of items) {
            if (item.workshopSessionId && item.vendorId) {
                const key = item.vendorId;
                if (!groups[key]) {
                    groups[key] = { vendorId: item.vendorId, vendorName: item.vendorName || item.workshopName || 'Workshop', items: [] };
                }
                groups[key].items.push(item);
            } else if (item.eventId) {
                // Group event tickets together as a pseudo-vendor
                const key = 'event';
                if (!groups[key]) {
                    groups[key] = { vendorId: 'event', vendorName: t('cart.event_tickets', 'Vé sự kiện'), items: [] };
                }
                groups[key].items.push(item);
            }
        }
        return Object.values(groups);
    };

    // Filter vouchers relevant to a vendor target
    const getFilteredVouchers = () => {
        if (voucherModalTarget === 'platform') {
            return vouchers.filter(v => !v.vendorId);
        }
        if (voucherModalTarget === 'event') {
            // Event vouchers are platform vouchers (no vendorId) that apply to events
            return vouchers.filter(v => !v.vendorId && (v.applicableProduct === 'EVENT_TICKET' || v.applicableProduct === 'ALL'));
        }
        return vouchers.filter(v => v.vendorId === voucherModalTarget);
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
        const selectedVoucherIds = Object.values(selectedVouchers).map(v => v.userVoucherId);
        navigation.navigate('PreCheckout', {
            selectedIds,
            selectedVoucherIds,
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
        const isWorkshop = !!item.workshopSessionId;
        const isEventTicket = !!item.eventId;

        const typeMeta = isWorkshop
            ? { color: '#a855f7', label: t('cart.workshop', 'Workshop'), icon: 'self-improvement' as const, parent: item.workshopName }
            : isEventTicket
                ? { color: '#3b82f6', label: t('cart.event_ticket', 'Event'), icon: 'event' as const, parent: item.eventName }
                : { color: '#f59e0b', label: t('cart.ticket', 'Ticket'), icon: 'confirmation-number' as const, parent: undefined };

        const canDecrement = item.quantity > 1;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                    },
                ]}
                onPress={() => toggleSelection(item.id)}
                activeOpacity={0.85}
            >
                {/* Header: checkbox + name + delete */}
                <View style={styles.cardHeader}>
                    <View
                        style={[
                            styles.checkbox,
                            {
                                borderColor: isSelected ? theme.primary : theme.mutedForeground,
                                backgroundColor: isSelected ? theme.primary : 'transparent',
                            },
                        ]}
                    >
                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>

                    <View style={styles.headerTextWrap}>
                        <Text
                            style={[styles.itemName, { color: theme.foreground }]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {item.itemName}
                        </Text>

                        {/* Type badge + parent name */}
                        <View style={styles.subRow}>
                            <View style={[styles.typeBadge, { backgroundColor: typeMeta.color + '22' }]}>
                                <MaterialIcons name={typeMeta.icon} size={11} color={typeMeta.color} />
                                <Text style={[styles.typeBadgeText, { color: typeMeta.color }]}>
                                    {typeMeta.label}
                                </Text>
                            </View>
                            {typeMeta.parent ? (
                                <Text
                                    style={[styles.parentName, { color: theme.mutedForeground }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {typeMeta.parent}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => handleRemoveItem(item.id)}
                        hitSlop={8}
                        style={styles.trashBtn}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                {/* Footer row 1: unit price + quantity stepper */}
                <View style={styles.priceRow}>
                    <View style={styles.priceWrap}>
                        <Text style={[styles.metaLabel, { color: theme.mutedForeground }]}>
                            {t('cart.price', 'Price')}
                        </Text>
                        <Text
                            style={[styles.priceText, { color: theme.foreground }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {item.price.toLocaleString()} VND
                        </Text>
                    </View>

                    <View style={[styles.stepper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                        <TouchableOpacity
                            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            style={styles.stepperBtn}
                            hitSlop={6}
                            disabled={!canDecrement}
                            activeOpacity={canDecrement ? 0.6 : 1}
                        >
                            <Ionicons
                                name="remove"
                                size={16}
                                color={canDecrement ? theme.foreground : theme.mutedForeground}
                            />
                        </TouchableOpacity>
                        <Text style={[styles.stepperValue, { color: theme.foreground }]}>{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            style={styles.stepperBtn}
                            hitSlop={6}
                        >
                            <Ionicons name="add" size={16} color={theme.foreground} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer row 2: subtotal */}
                <View style={styles.subtotalRow}>
                    <Text style={[styles.metaLabel, { color: theme.mutedForeground }]}>
                        {t('cart.subtotal', 'Subtotal')}
                    </Text>
                    <Text
                        style={[styles.subtotalValue, { color: theme.primary }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {item.totalPrice.toLocaleString()} VND
                    </Text>
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
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.foreground }}>{t('cart.select_voucher', 'Chọn voucher')}</Text>
                            <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                                <MaterialIcons name="close" size={24} color={theme.foreground} />
                            </TouchableOpacity>
                        </View>

                        {loadingVouchers ? (
                            <Text style={{ color: theme.foreground, textAlign: 'center', padding: 20 }}>Loading vouchers...</Text>
                        ) : (
                            <FlatList
                                data={getFilteredVouchers()}
                                keyExtractor={(item) => item.userVoucherId}
                                renderItem={({ item }) => {
                                    const apInfo = getApplicableLabel(item.applicableProduct);
                                    const isCurrentlySelected = selectedVouchers[voucherModalTarget]?.userVoucherId === item.userVoucherId;
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
                                                backgroundColor: isCurrentlySelected ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                                            }}
                                            onPress={() => {
                                                setSelectedVouchers(prev => ({
                                                    ...prev,
                                                    [voucherModalTarget]: item,
                                                }));
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
                                                    {isCurrentlySelected && (
                                                        <MaterialIcons name="check-circle" size={16} color="#22c55e" />
                                                    )}
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                                                    {item.maxDiscountValue ? (
                                                        <Text style={{ color: theme.mutedForeground, fontSize: 11 }}>
                                                            {t('cart.max_save')}: {item.maxDiscountValue.toLocaleString()} VND
                                                        </Text>
                                                    ) : null}
                                                    {item.endDate ? (
                                                        <Text style={{ color: '#f59e0b', fontSize: 11 }}>
                                                            {t('cart.exp')}: {new Date(item.endDate).toLocaleDateString()}
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
                                ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: theme.mutedForeground }}>{t('cart.no_vouchers')}</Text>}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                {/* Per-vendor voucher selection */}
                {getVendorGroups().map((group) => {
                    const selectedV = selectedVouchers[group.vendorId];
                    return (
                        <TouchableOpacity
                            key={group.vendorId}
                            onPress={() => {
                                setVoucherModalTarget(group.vendorId);
                                fetchVouchers();
                                setShowVoucherModal(true);
                            }}
                            style={{
                                padding: 10,
                                marginBottom: 8,
                                borderWidth: 1,
                                borderColor: selectedV ? theme.primary : (theme.border || '#e5e5e5'),
                                borderRadius: 8,
                                backgroundColor: selectedV ? 'rgba(34, 197, 94, 0.05)' : theme.background,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <MaterialIcons name="local-offer" size={16} color={selectedV ? '#22c55e' : theme.mutedForeground} style={{ marginRight: 6 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.mutedForeground, fontSize: 11 }} numberOfLines={1}>
                                        {group.vendorName}
                                    </Text>
                                    <Text style={{ color: selectedV ? theme.primary : theme.mutedForeground, fontSize: 13 }} numberOfLines={1}>
                                        {selectedV ? `${selectedV.code} (${formatDiscount(selectedV)})` : t('cart.select_voucher', 'Chọn voucher')}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {selectedV && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedVouchers(prev => {
                                                const next = { ...prev };
                                                delete next[group.vendorId];
                                                return next;
                                            });
                                        }}
                                        style={{ marginRight: 4 }}
                                    >
                                        <MaterialIcons name="close" size={18} color={theme.mutedForeground} />
                                    </TouchableOpacity>
                                )}
                                <MaterialIcons name="chevron-right" size={20} color={theme.mutedForeground} />
                            </View>
                        </TouchableOpacity>
                    );
                })}

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
        padding: 14,
        borderRadius: 14,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    headerTextWrap: {
        flex: 1,
        minWidth: 0,
        gap: 6,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    parentName: {
        flex: 1,
        minWidth: 0,
        fontSize: 12,
    },
    trashBtn: {
        padding: 6,
        borderRadius: 8,
        marginTop: -2,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 12,
        opacity: 0.7,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    priceWrap: {
        flex: 1,
        minWidth: 0,
    },
    metaLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
    },
    stepperBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    stepperValue: {
        fontWeight: '700',
        fontSize: 14,
        minWidth: 22,
        textAlign: 'center',
    },
    subtotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 10,
    },
    subtotalValue: {
        fontSize: 16,
        fontWeight: '800',
        flexShrink: 1,
        textAlign: 'right',
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
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
