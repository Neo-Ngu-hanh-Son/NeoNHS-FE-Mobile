import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { transactionService } from '../services/transactionService';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import * as ImagePicker from 'expo-image-picker';
import RNQRGenerator from 'rn-qr-generator';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function TicketVerificationScreen() {
    const navigation = useNavigation();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || loading) return;
        setScanned(true);
        setLoading(true);

        try {
            console.log(`Bar code with type ${type} and data ${data} has been scanned!`);

            // Clean the code if necessary (sometimes URLs are scanned)
            // Assuming the QR code contains the ticket code string directly

            const response = await transactionService.verifyTicket(data);

            if (response.status === 200 || response.success) {
                Alert.alert(
                    "Success",
                    "Ticket verified successfully!",
                    [{ text: "OK", onPress: () => setScanned(false) }]
                );
            } else {
                Alert.alert(
                    "Verification Failed",
                    response.message || "Invalid Ticket",
                    [{ text: "Scan Again", onPress: () => setScanned(false) }]
                );
            }

        } catch (error: any) {
            // console.error("Verification error:", error); not need
            // Alert.alert(
            //     "Error",
            //     error.message || "Failed to verify ticket",
            //     [{ text: "Scan Again", onPress: () => setScanned(false) }]
            // );
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Set to true if you want to let user crop
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLoading(true);
                const imageUri = result.assets[0].uri;

                // Detect QR code from image
                RNQRGenerator.detect({
                    uri: imageUri,
                })
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
                        console.error('QR detection error:', error);
                        Alert.alert('Error', 'Failed to detect QR code from image.');
                        setLoading(false);
                    });
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image.');
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Scan Ticket</Text>

                        <TouchableOpacity
                            onPress={handlePickImage}
                            style={styles.iconButton}
                        >
                            <Ionicons name="image" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.scanAreaContainer}>
                        <View style={styles.scanArea} />
                        <Text style={styles.instructionText}>
                            Align the QR code within the frame to scan
                        </Text>
                    </View>
                </View>
            </CameraView>

            <LoadingOverlay visible={loading} message="Verifying Ticket..." />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    button: {
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
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
    scanAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        borderWidth: 2,
        borderColor: '#22c55e', // Green border
        backgroundColor: 'transparent',
        borderRadius: 20,
    },
    instructionText: {
        color: 'white',
        marginTop: 20,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    }
});
