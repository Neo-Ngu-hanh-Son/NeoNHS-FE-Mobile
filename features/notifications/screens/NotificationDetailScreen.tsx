import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

type NotificationDetailRouteProp = RouteProp<MainStackParamList, 'NotificationDetail'>;

const getNotificationIcon = (
    type: string,
    theme: typeof THEME.light
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type?.toUpperCase()) {
        case 'EVENT':
            return { name: 'calendar', color: '#6366f1' };
        case 'CHECKIN_SUCCESS':
            return { name: 'location', color: '#22c55e' };
        case 'ORDER_SUCCESS':
            return { name: 'card', color: '#f59e0b' };
        case 'REPORT_RESOLVED':
            return { name: 'checkmark-circle', color: '#10b981' };
        case 'REPORT_REJECTED':
            return { name: 'document-text', color: '#8b5cf6' };
        default:
            return { name: 'notifications', color: theme.primary };
    }
};

const getNotificationLabel = (type: string, t: any): string => {
    switch (type?.toUpperCase()) {
        case 'EVENT':
            return t('notifications.types.event');
        case 'CHECKIN_SUCCESS':
            return t('notifications.types.checkin_success');
        case 'ORDER_SUCCESS':
            return t('notifications.types.order_success');
        case 'REPORT_RESOLVED':
            return t('notifications.types.report_resolved');
        case 'REPORT_REJECTED':
            return t('notifications.types.report_rejected');
        default:
            return t('notifications.types.default');
    }
};

export default function NotificationDetailScreen() {
    const route = useRoute<NotificationDetailRouteProp>();
    const { notification } = route.params;
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { t } = useTranslation();
    const icon = getNotificationIcon(notification.type, theme);
    const label = getNotificationLabel(notification.type, t);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Icon + Type badge */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: icon.color + '18' }]}>
                        <Ionicons name={icon.name} size={36} color={icon.color} />
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: icon.color + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: icon.color }]}>{label}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: theme.foreground }]}>{notification.title}</Text>

                {/* Timestamp */}
                <Text style={[styles.timestamp, { color: theme.mutedForeground }]}>
                    {new Date(notification.createdAt).toLocaleString()}
                </Text>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                {/* Full message */}
                <Text style={[styles.message, { color: theme.foreground }]}>{notification.message}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
    },
    typeBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 13,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'left',
        width: '100%',
    },
});
