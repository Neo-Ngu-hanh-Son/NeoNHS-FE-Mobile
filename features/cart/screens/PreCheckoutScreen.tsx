import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { cartService } from '../services/cartService';
import { PreCheckoutResponse, CartItem, Voucher, ApplicableProduct } from '../types';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { logger } from '@/utils/logger';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface GroupedItems {
    groupName: string;
    groupType: 'event' | 'workshop' | 'other';
    items: CartItem[];
}

function groupCartItems(cartItems: CartItem[]): GroupedItems[] {
    const groups: Record<string, GroupedItems> = {};

    for (const item of cartItems) {
        let key: string;
        let groupName: string;
        let groupType: 'event' | 'workshop' | 'other';

        if (item.eventId && item.eventName) {
            key = `event-${item.eventId}`;
            groupName = item.eventName;
            groupType = 'event';
        } else if (item.workshopSessionId && item.workshopName) {
            key = `workshop-${item.workshopSessionId}`;
            groupName = item.workshopName;
            groupType = 'workshop';
        } else {
            key = 'other';
            groupName = 'Other Items';
            groupType = 'other';
        }

        if (!groups[key]) {
            groups[key] = { groupName, groupType, items: [] };
        }
        groups[key].items.push(item);
    }

    return Object.values(groups);
}

export default function PreCheckoutScreen() {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t } = useTranslation();

    // Expect selectedIds from route params
    const { selectedIds, selectedVoucherId } = route.params || { selectedIds: [], selectedVoucherId: null };

    const [loading, setLoading] = useState(false);
    const [preCheckoutData, setPreCheckoutData] = useState<PreCheckoutResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const groupedItems = useMemo(() => {
        if (!preCheckoutData) return [];
        return groupCartItems(preCheckoutData.cartItems);
    }, [preCheckoutData]);

    // Calculate how much discount applies to each group
    const getGroupDiscount = (groupType: 'event' | 'workshop' | 'other'): number => {
        const voucher = preCheckoutData?.appliedVoucher;
        if (!voucher || preCheckoutData.discountValue <= 0) return 0;
        const ap: ApplicableProduct = voucher.applicableProduct;
        if (ap === 'ALL') return 0; // shown globally in Payment Summary
        if (ap === 'EVENT_TICKET' && groupType === 'event') return preCheckoutData.discountValue;
        if (ap === 'WORKSHOP' && groupType === 'workshop') return preCheckoutData.discountValue;
        return 0;
    };



    const fetchPreCheckout = async () => {
        setLoading(true);
        try {
            const payload = {
                cartItemIds: selectedIds,
                voucherIds: selectedVoucherId ? [selectedVoucherId] : []
            };
            const response = await cartService.preCheckout(payload);

            if (response.success && response.data) {
                setPreCheckoutData(response.data);
                logger.info("Pre-checkout successful", response.data);
            } else {
                Alert.alert("Error", response.message || "Pre-checkout failed");
                navigation.goBack();
            }
        } catch (error: any) {
            logger.error("Pre-checkout error", error);
            Alert.alert("Error", error.message || "Pre-checkout failed");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePaymentLink = async () => {
        if (!preCheckoutData || isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);
        try {
            const payload = {
                cartItemIds: selectedIds,
                voucherIds: selectedVoucherId ? [selectedVoucherId] : []
            };

            const response = await cartService.createPaymentLink(payload);
            if (response.success && response.data) {
                logger.info("Payment link created", response.data);
                navigation.navigate('Payment', {
                    checkoutUrl: response.data.checkoutUrl,
                    orderCode: response.data.orderCode
                });
            } else {
                Alert.alert("Error", response.message || "Failed to create payment link");
                setIsSubmitting(false);
            }
        } catch (error: any) {
            logger.error("Create payment link error", error);
            Alert.alert("Error", error.message || "Failed to create payment link");
            setIsSubmitting(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreCheckout();
    }, []);

    if (!preCheckoutData) return <LoadingOverlay visible={loading} message={t('common.loading')} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="chevron-left" size={32} color={theme.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.foreground }]}>{t('cart.checkout')}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Items ({preCheckoutData.cartItems.length})</Text>
                    {groupedItems.map((group, groupIndex) => (
                        <View key={groupIndex} style={groupIndex > 0 ? { marginTop: 16 } : undefined}>
                            {/* Group header */}
                            <View style={[styles.groupHeader, { backgroundColor: group.groupType === 'event' ? 'rgba(59, 130, 246, 0.08)' : group.groupType === 'workshop' ? 'rgba(168, 85, 247, 0.08)' : 'rgba(107, 114, 128, 0.08)' }]}>
                                <MaterialIcons
                                    name={group.groupType === 'event' ? 'event' : group.groupType === 'workshop' ? 'handyman' : 'category'}
                                    size={16}
                                    color={group.groupType === 'event' ? '#3b82f6' : group.groupType === 'workshop' ? '#a855f7' : '#6b7280'}
                                />
                                <Text style={[styles.groupName, { color: group.groupType === 'event' ? '#3b82f6' : group.groupType === 'workshop' ? '#a855f7' : '#6b7280' }]}>
                                    {group.groupName}
                                </Text>
                            </View>
                            {/* Items in group */}
                            {group.items.map((item, index) => (
                                <View key={item.id || index} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
                                    <View style={{ flex: 1, paddingLeft: 8 }}>
                                        <Text style={{ color: theme.foreground, fontWeight: '500' }}>{item.itemName}</Text>
                                        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>Qty: {item.quantity}</Text>
                                    </View>
                                    <Text style={{ color: theme.foreground }}>{(item.totalPrice ?? 0).toLocaleString()} VND</Text>
                                </View>
                            ))}
                            {/* Per-group voucher discount indicator */}
                            {getGroupDiscount(group.groupType) > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingLeft: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <MaterialIcons name="local-offer" size={13} color="#22c55e" />
                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>
                                            {preCheckoutData!.appliedVoucher!.code}
                                        </Text>
                                    </View>
                                    <Text style={{ color: '#22c55e', fontWeight: '600', fontSize: 13 }}>
                                        -{(getGroupDiscount(group.groupType) ?? 0).toLocaleString()} VND
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Payment Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.mutedForeground }}>{t('cart.subtotal')}</Text>
                        <Text style={{ color: theme.foreground }}>{(preCheckoutData.totalPrice ?? 0).toLocaleString()} VND</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.mutedForeground }}>{t('cart.discount')}</Text>
                        <Text style={{ color: '#22c55e' }}>-{(preCheckoutData.discountValue ?? 0).toLocaleString()} VND</Text>
                    </View>

                    {preCheckoutData.appliedVoucher && (
                        <View style={[styles.voucherRow, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                            <MaterialIcons name="local-offer" size={16} color="#22c55e" />
                            <Text style={{ color: '#22c55e', fontSize: 12, marginLeft: 4 }}>
                                Applied: {preCheckoutData.appliedVoucher.code}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.foreground, fontWeight: 'bold', fontSize: 16 }}>{t('cart.total')}</Text>
                        <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 20 }}>{(preCheckoutData.finalTotalPrice ?? 0).toLocaleString()} VND</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <Button onPress={handleCreatePaymentLink} disabled={isSubmitting || loading}>
                    <Text style={{ color: 'white' }}>{isSubmitting ? t('common.loading') : t('cart.confirm_payment')}</Text>
                </Button>
            </View>
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
        gap: 20,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 4,
        gap: 6,
    },
    groupName: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    voucherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 4,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    }
});
