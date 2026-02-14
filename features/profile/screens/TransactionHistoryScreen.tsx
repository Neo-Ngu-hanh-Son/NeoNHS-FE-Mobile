import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { transactionService } from '../services/transactionService';

// Mock Data (Removed)
//
const TABS = ['All', 'Event', 'Workshop'];
const STATUS_FILTERS = ['All', 'PENDING', 'PAID', 'CANCELLED', 'FAILED'];

export default function TransactionHistoryScreen() {
    const navigation = useNavigation<any>();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [activeTab, setActiveTab] = useState('All');
    const [activeStatus, setActiveStatus] = useState('All');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await transactionService.getTransactions();
                if (response.data) {
                    setTransactions(response.data);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            // Filter by Tab (Type)
            // API returns EVENT/WORKSHOP (uppercase), Tabs are Event/Workshop (Title case)
            // Normalize to uppercase for comparison
            const itemType = item.type ? item.type.toUpperCase() : '';
            const tabFilter = activeTab.toUpperCase();

            const matchesTab = activeTab === 'All' || itemType === tabFilter;

            // Filter by Status
            // API returns SUCCESS, UI uses PAID.
            let itemStatus = item.status;
            if (itemStatus === 'SUCCESS') itemStatus = 'PAID';

            const matchesStatus = activeStatus === 'All' || itemStatus === activeStatus;

            return matchesTab && matchesStatus;
        });
    }, [activeTab, activeStatus, transactions]);

    const handleDownload = (id: string, e: any) => {
        e.stopPropagation();
        console.log('Download', id);
    };

    const getStatusColor = (status: string) => {
        const normalizedStatus = status === 'SUCCESS' ? 'PAID' : status;
        switch (normalizedStatus) {
            case 'PAID': return '#15803d'; // green-700
            case 'PENDING': return '#b45309'; // amber-700
            case 'CANCELLED': return '#b91c1c'; // red-700
            case 'FAILED': return '#b91c1c'; // red-700
            default: return theme.mutedForeground;
        }
    };

    const getStatusBg = (status: string) => {
        const normalizedStatus = status === 'SUCCESS' ? 'PAID' : status;
        switch (normalizedStatus) {
            case 'PAID': return '#effcf6';
            case 'PENDING': return '#fffbeb';
            case 'CANCELLED': return '#fef2f2';
            case 'FAILED': return '#fef2f2';
            default: return theme.muted;
        }
    };

    const getIconForType = (type: string) => {
        const lowerType = type ? type.toLowerCase() : '';
        if (lowerType === 'event') return 'sailboat';
        if (lowerType === 'workshop') return 'hands-holding-circle';
        return 'receipt';
    };

    const renderItem = ({ item }: { item: any }) => {
        const displayStatus = item.status === 'SUCCESS' ? 'PAID' : item.status;
        const formattedDate = new Date(item.transactionDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
                activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <FontAwesome6 name={getIconForType(item.type)} size={20} color={getStatusColor(displayStatus)} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: theme.foreground }]} numberOfLines={2}>
                            {item.type} payment
                        </Text>
                        <Text style={{ color: theme.mutedForeground, fontSize: 12, marginBottom: 4 }}>Order #{item.orderId?.slice(0, 8)}</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(displayStatus) }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>{displayStatus}</Text>
                            </View>
                            <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{formattedDate}</Text>
                        </View>
                    </View>
                    <Text style={[styles.amount, { color: theme.foreground }]}>{formattedAmount}</Text>
                </View>

                {displayStatus === 'PAID' && (
                    <TouchableOpacity
                        style={[styles.downloadButton, { backgroundColor: getStatusColor(displayStatus) }]}
                        onPress={(e) => handleDownload(item.id, e)}
                        activeOpacity={0.8}>
                        <MaterialIcons name="picture-as-pdf" size={18} color="white" />
                        <Text style={styles.downloadText}>Download Receipt</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        )
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : '#F7F9FC' }]}>
            <StatusBar barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'} />

            {/* Header Area */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="chevron-left" size={32} color={theme.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>Transaction History</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* Main Tabs (Type) */}
                <View style={styles.tabsContainer}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                            onPress={() => setActiveTab(tab)}>
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: activeTab === tab ? '#15803d' : theme.mutedForeground },
                                    activeTab === tab && styles.activeTabText,
                                ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Status Filter Chips */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                        {STATUS_FILTERS.map((status) => {
                            const isActive = activeStatus === status;
                            return (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterChip,
                                        isActive && styles.activeFilterChip,
                                        { borderColor: isActive ? '#15803d' : theme.border, backgroundColor: isActive ? '#15803d' : 'transparent' }
                                    ]}
                                    onPress={() => setActiveStatus(status)}>
                                    <Text style={[
                                        styles.filterText,
                                        { color: isActive ? 'white' : theme.mutedForeground }
                                    ]}>
                                        {status === 'All' ? 'All Status' : status}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </SafeAreaView>

            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.mutedForeground }}>No transactions found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tabItem: {
        marginRight: 24,
        paddingVertical: 12,
    },
    activeTabItem: {
        borderBottomWidth: 2,
        borderBottomColor: '#15803d',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
    },
    activeTabText: {
        fontWeight: '700',
    },
    filterContainer: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    activeFilterChip: {
        borderWidth: 0,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#effcf6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    downloadText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});
