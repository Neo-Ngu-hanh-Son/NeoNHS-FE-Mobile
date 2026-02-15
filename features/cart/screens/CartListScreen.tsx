import React, { useState, useEffect } from 'react';
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

export default function CartListScreen() {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<Cart | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const handleProceedToPreCheckout = () => {
        if (selectedItems.size === 0) {
            Alert.alert("Selection Required", "Please select at least one item to proceed.");
            return;
        }
        const selectedIds = Array.from(selectedItems);
        navigation.navigate('PreCheckout', {
            selectedIds,
            selectedVoucherId: selectedVoucher?.userVoucherId
        });
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
                <Text style={[styles.title, { color: theme.foreground }]}>My Cart</Text>
                <Button size="sm" variant="outline" onPress={fetchCart}>
                    <Text>Refresh</Text>
                </Button>
            </View>

            <FlatList
                data={cart?.items || []}
                renderItem={renderCartItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.mutedForeground }}>Your cart is empty</Text>
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
                            {selectedVoucher ? `${selectedVoucher.code} (-${selectedVoucher.discountValue.toLocaleString()} VND)` : "Select Voucher / Coupon"}
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
                    <Text style={{ color: theme.foreground }}>Selected: {selectedItems.size}</Text>
                    <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>
                        Total: {
                            cart?.items
                                .filter(item => selectedItems.has(item.id))
                                .reduce((sum, item) => sum + item.totalPrice, 0)
                                .toLocaleString() || 0
                        } VND
                    </Text>
                </View>
                <Button onPress={handleProceedToPreCheckout} disabled={selectedItems.size === 0}>
                    <Text style={{ color: 'white' }}>Proceed to Checkout</Text>
                </Button>
            </View>

            <LoadingOverlay visible={loading} message="Loading Cart..." />
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
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
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
