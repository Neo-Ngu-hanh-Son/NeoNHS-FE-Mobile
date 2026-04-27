import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { transactionService } from '../services/transactionService';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '@/utils/logger';
import RNQRGenerator from 'rn-qr-generator';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type TabMode = 'scan' | 'manual';

export default function TicketVerificationScreen() {
    const navigation = useNavigation();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabMode>('scan');
    const [manualCode, setManualCode] = useState('');

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Text style={{ textAlign: 'center', marginBottom: 20, color: theme.foreground }}>
                    We need your permission to show the camera
                </Text>
                <TouchableOpacity onPress={requestPermission} style={[styles.button, { backgroundColor: theme.primary }]}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ─── Shared verify logic used by both QR scan and Manual Entry ───
    const verifyCode = async (code: string) => {
        if (!code.trim()) return;
        setLoading(true);
        try {
            logger.info(`Verifying ticket code: ${code}`);
            const response = await transactionService.verifyTicket(code.trim());

            if (response.status === 200 || response.success) {
                Alert.alert(
                    '✅ Success',
                    'Ticket verified successfully!',
                    [{
                        text: 'OK', onPress: () => {
                            setScanned(false);
                            setManualCode('');
                        }
                    }]
                );
            } else {
                Alert.alert(
                    'Verification Failed',
                    response.message || 'Invalid Ticket',
                    [{ text: 'Try Again', onPress: () => setScanned(false) }]
                );
            }
        } catch (error: any) {
            logger.error('Verification error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to verify ticket',
                [{ text: 'Try Again', onPress: () => setScanned(false) }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || loading) return;
        setScanned(true);
        await verifyCode(data);
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLoading(true);
                const imageUri = result.assets[0].uri;

                RNQRGenerator.detect({ uri: imageUri })
                    .then(response => {
                        const { values } = response;
                        if (values && values.length > 0) {
                            handleBarCodeScanned({ type: 'qr', data: values[0] });
                        } else {
                            Alert.alert('No QR Code detected', 'Please try another image.');
                            setLoading(false);
                        }
                    })
                    .catch(error => {
                        logger.error('QR detection error:', error);
                        Alert.alert('Error', 'Failed to detect QR code from image.');
                        setLoading(false);
                    });
            }
        } catch (error) {
            logger.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image.');
            setLoading(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualCode.trim()) {
            Alert.alert('Input Required', 'Please enter a ticket code.');
            return;
        }
        await verifyCode(manualCode);
    };

    // ─── Tab Switcher ───
    const renderTabSwitcher = () => (
        <View style={styles.tabSwitcher}>
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'scan' && styles.tabBtnActive]}
                onPress={() => setActiveTab('scan')}
            >
                <Ionicons name="qr-code" size={15} color={activeTab === 'scan' ? '#fff' : 'rgba(255,255,255,0.55)'} />
                <Text style={[styles.tabBtnText, activeTab === 'scan' && styles.tabBtnTextActive]}>
                    QR Scan
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'manual' && styles.tabBtnActive]}
                onPress={() => setActiveTab('manual')}
            >
                <MaterialIcons name="keyboard" size={15} color={activeTab === 'manual' ? '#fff' : 'rgba(255,255,255,0.55)'} />
                <Text style={[styles.tabBtnText, activeTab === 'manual' && styles.tabBtnTextActive]}>
                    Manual Entry
                </Text>
            </TouchableOpacity>
        </View>
    );

    // ─── Manual Entry Bottom Panel ───
    const renderManualPanel = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.manualPanelWrapper}
        >
            <View style={styles.manualPanel}>
                {/* Drag handle */}
                <View style={styles.panelHandle} />

                <Text style={styles.manualTitle}>Enter Ticket Code</Text>
                <Text style={styles.manualSubtitle}>
                    Type the ticket code printed on your ticket or confirmation email.
                </Text>

                {/* Input */}
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="confirmation-number" size={20} color="#6b7280" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.codeInput}
                        placeholder="e.g. TKT-ABC123"
                        placeholderTextColor="#9ca3af"
                        value={manualCode}
                        onChangeText={setManualCode}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleManualSubmit}
                    />
                    {manualCode.length > 0 && (
                        <TouchableOpacity onPress={() => setManualCode('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Verify button */}
                <TouchableOpacity
                    style={[styles.verifyBtn, manualCode.trim().length === 0 && { opacity: 0.45 }]}
                    onPress={handleManualSubmit}
                    disabled={manualCode.trim().length === 0}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="verified" size={20} color="white" />
                    <Text style={styles.verifyBtnText}>Verify Ticket</Text>
                </TouchableOpacity>

                <Text style={styles.manualHint}>
                    💡 Ticket codes are case-insensitive and contain letters and numbers only.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={(activeTab === 'scan' && !scanned) ? handleBarCodeScanned : undefined}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            >
                <View style={styles.overlay}>

                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Ticket Verification</Text>
                        {/* Pick from gallery — only relevant in scan mode */}
                        <TouchableOpacity
                            onPress={handlePickImage}
                            style={[styles.iconButton, activeTab === 'manual' && { opacity: 0.3 }]}
                            disabled={activeTab === 'manual'}
                        >
                            <Ionicons name="image" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Tab Switcher ── */}
                    {renderTabSwitcher()}

                    {/* ── QR Scan Area ── */}
                    {activeTab === 'scan' && (
                        <View style={styles.scanAreaContainer}>
                            <View style={styles.scanFrame}>
                                <View style={[styles.corner, styles.cornerTL]} />
                                <View style={[styles.corner, styles.cornerTR]} />
                                <View style={[styles.corner, styles.cornerBL]} />
                                <View style={[styles.corner, styles.cornerBR]} />
                            </View>
                            <Text style={styles.instructionText}>
                                Align the QR code within the frame to scan
                            </Text>
                        </View>
                    )}

                    {/* ── Manual Entry Panel ── */}
                    {activeTab === 'manual' && renderManualPanel()}
                </View>
            </CameraView>

            <LoadingOverlay visible={loading} message="Verifying Ticket..." />
        </View>
    );
}

const CORNER_SIZE = 26;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    // ── Overlay ──
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },

    // ── Tab Switcher ──
    tabSwitcher: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 30,
        padding: 4,
    },
    tabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 26,
    },
    tabBtnActive: {
        backgroundColor: '#22c55e',
    },
    tabBtnText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        fontWeight: '600',
    },
    tabBtnTextActive: {
        color: '#fff',
    },

    // ── Scan Area ──
    scanAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: '#22c55e',
    },
    cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 6 },
    cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 6 },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 6 },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 6 },
    instructionText: {
        color: 'white',
        marginTop: 24,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },

    // ── Manual Entry Panel ──
    manualPanelWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    manualPanel: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 48,
        gap: 14,
    },
    panelHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 4,
    },
    manualTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    manualSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    codeInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        letterSpacing: 1.5,
    },
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#22c55e',
        borderRadius: 16,
        paddingVertical: 16,
    },
    verifyBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    manualHint: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
    },
});
