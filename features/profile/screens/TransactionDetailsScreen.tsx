import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { transactionService } from '../services/transactionService';
import { TransactionDetail, Ticket } from '../types/transaction';
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from 'react-native-view-shot';

const { width } = Dimensions.get('window');

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE': return '#22c55e';
        case 'USED': return '#64748b';
        case 'EXPIRED': return '#ef4444';
        default: return '#94a3b8';
    }
};

export default function TransactionDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { transactionId } = route.params as { transactionId: string };

    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [showToast, setShowToast] = useState(false);
    const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const viewShotRef = useRef<ViewShot>(null);
    const [status, requestPermission] = MediaLibrary.usePermissions();

    React.useEffect(() => {
        if (!transactionId) {
            setLoading(false);
            return;
        }
        const fetchDetails = async () => {
            try {
                const response = await transactionService.getTransactionDetails(transactionId);
                if (response.data) {
                    setTransaction(response.data);
                }
            } catch (error) {
                console.error('Error fetching transaction details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [transactionId]);

    const handleDownload = async () => {
        if (!selectedTicket) return;

        if (status === null || status.status !== 'granted') {
            const permission = await requestPermission();
            if (!permission.granted) {
                Alert.alert('Permission required', 'Permission to access media library is required to save the ticket.');
                return;
            }
        }

        try {
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                await MediaLibrary.saveToLibraryAsync(uri);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Error saving ticket:", error);
            Alert.alert("Error", "Failed to save ticket image.");
        }
    };



    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : '#F7F9FC', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.foreground }}>Loading...</Text>
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : '#F7F9FC', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.foreground }}>Transaction not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10 }}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formattedDate = new Date(transaction.transactionDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount);

    const renderTicketDetailsModal = () => (
        <Modal
            visible={!!selectedTicket}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedTicket(null)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setSelectedTicket(null)} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={theme.foreground} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.foreground }]}>Ticket Details</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.modalScrollContent}>
                        {/* Order Summary */}
                        <View style={[styles.sectionContainer, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Order Summary</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Order ID</Text>
                                <Text style={[styles.value, { color: theme.foreground }]}>#{transaction.orderId ? transaction.orderId.slice(0, 8).toUpperCase() : 'N/A'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={[styles.value, { color: theme.foreground }]}>{formattedDate}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Total Amount</Text>
                                <Text style={[styles.value, { color: theme.foreground }]}>{formattedAmount}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Order Status</Text>
                                <Text style={[styles.value, { color: transaction.status === 'SUCCESS' ? '#15803d' : theme.foreground }]}>
                                    {transaction.status === 'SUCCESS' ? 'PAID' : transaction.status}
                                </Text>
                            </View>
                        </View>

                        {/* Ticket Details */}
                        {selectedTicket && (
                            <View style={styles.ticketDetailContainer}>
                                <Text style={[styles.ticketTitle, { color: theme.foreground }]}>{selectedTicket.itemName}</Text>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Ticket Code</Text>
                                    <Text style={[styles.value, { color: theme.primary }]}>{selectedTicket.ticketCode}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Type</Text>
                                    <Text style={[styles.value, { color: theme.foreground }]}>{selectedTicket.ticketType}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Status</Text>
                                    <Text style={[styles.value, { color: selectedTicket.status === 'ACTIVE' ? '#15803d' : theme.foreground }]}>
                                        {selectedTicket.status}
                                    </Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Valid From</Text>
                                    <Text style={[styles.value, { color: theme.foreground }]}>
                                        {new Date(selectedTicket.validFrom).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Valid To</Text>
                                    <Text style={[styles.value, { color: theme.foreground }]}>
                                        {new Date(selectedTicket.validTo).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>

                                {/* QR Code Section to be Captured */}
                                <ViewShot
                                    ref={viewShotRef}
                                    options={{ format: "png", quality: 1.0 }}
                                    style={{ backgroundColor: 'white' }} // Ensure white background for capture
                                >
                                    <View style={styles.qrSection}>
                                        <View style={styles.qrContainer}>
                                            {selectedTicket.ticketCode ? (
                                                <QRCode value={selectedTicket.ticketCode}
                                                    size={180}
                                                />
                                            ) : (
                                                <MaterialIcons name="qr-code-2" size={120} color="#cbd5e1" />
                                            )}
                                        </View>
                                        <Text style={styles.scanText}>SCAN TO VERIFY</Text>
                                    </View>
                                </ViewShot>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.downloadButton}
                            activeOpacity={0.8}
                            onPress={handleDownload}
                        >
                            <MaterialIcons name="file-download" size={24} color="white" />
                            <Text style={styles.downloadButtonText}>Download Ticket PDF</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>

            {showToast && (
                <View style={styles.toast}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <View>
                        <Text style={styles.toastTitle}>Success</Text>
                        <Text style={styles.toastSub}>Ticket downloaded successfully</Text>
                    </View>
                </View>
            )}
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : '#F7F9FC' }]}>
            <StatusBar barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'} />
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="chevron-left" size={32} color={theme.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>Transaction Details</Text>
                    <View style={{ width: 32 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.transactionSummary}>
                    <Text style={[styles.summaryTitle, { color: theme.foreground }]}>Transaction Summary</Text>
                    <Text style={{ color: theme.mutedForeground, marginBottom: 4 }}>Order #{transaction.orderId ? transaction.orderId.slice(0, 8).toUpperCase() : 'N/A'}</Text>
                    <Text style={{ color: theme.mutedForeground }}>{formattedDate}</Text>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.foreground, marginTop: 24, marginBottom: 16 }]}>Tickets List</Text>

                {transaction.tickets && transaction.tickets.length > 0 ? (
                    transaction.tickets.map((ticket) => (
                        <TouchableOpacity
                            key={ticket.id}
                            style={[styles.ticketCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => setSelectedTicket(ticket)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.ticketIconContainer}>
                                <FontAwesome5
                                    name={ticket.ticketType === 'EVENT' ? 'calendar-alt' : 'tools'}
                                    size={20}
                                    color={theme.primary}
                                />
                            </View>
                            <View style={styles.ticketInfo}>
                                <Text style={[styles.ticketName, { color: theme.foreground }]} numberOfLines={1}>{ticket.itemName}</Text>
                                <Text style={[styles.ticketCode, { color: theme.mutedForeground }]}>{ticket.ticketCode}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>{ticket.status}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={theme.mutedForeground} />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.mutedForeground }}>No tickets found for this order.</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {renderTicketDetailsModal()}
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
    scrollContent: {
        padding: 20,
    },
    transactionSummary: {
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    ticketCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    ticketIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(21, 128, 61, 0.1)', // Assuming primary is green-ish
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    ticketInfo: {
        flex: 1,
    },
    ticketName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    ticketCode: {
        fontSize: 13,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalScrollContent: {
        padding: 20,
    },
    sectionContainer: {
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        color: '#94a3b8', // slate-400
        fontWeight: '600',
        fontSize: 15,
    },
    value: {
        fontWeight: '700',
        fontSize: 15,
        flex: 1,
        textAlign: 'right',
        marginLeft: 16,
    },
    ticketDetailContainer: {
        marginBottom: 24,
    },
    ticketTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center',
    },
    qrSection: {
        alignItems: 'center',
        marginTop: 32,
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    qrContainer: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 1,
    },
    downloadButton: {
        backgroundColor: '#15803d',
        borderRadius: 30,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        shadowColor: '#15803d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    downloadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    toast: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
        elevation: 100, // Ensure toast is above modal on Android
    },
    toastTitle: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    toastSub: {
        color: '#94a3b8',
        fontSize: 12,
    },
});
