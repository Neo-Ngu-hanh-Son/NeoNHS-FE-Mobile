import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { apiClient } from '@/services/api/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    referenceId: string | null;
    isRead: boolean;
    createdAt: string;
};

type PaginationResponse = {
    content: Notification[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

export default function NotificationsScreen() {
    const { user, setUnreadNotificationCount } = useAuth();
    const navigation = useNavigation<any>();
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (pageNumber: number, isRefresh = false) => {
        if (!user?.email) return;
        try {
            if (isRefresh) setRefreshing(true);

            const response = await apiClient.get<PaginationResponse>('/notifications', {
                params: { email: user.email, page: pageNumber, size: 20 }
            });

            const newItems = response.data.content;
            setNotifications(prev => isRefresh ? newItems : [...prev, ...newItems]);
            setHasMore(!response.data.last);
            setPage(pageNumber);

            if (isRefresh) {
                await apiClient.put('/notifications/read-all');
                setUnreadNotificationCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications(0, true);
    }, [user]);

    const onRefresh = () => {
        fetchNotifications(0, true);
    };

    const onLoadMore = () => {
        if (hasMore && !loading) {
            fetchNotifications(page + 1);
        }
    };

    const markAsRead = async (id: string, isRead: boolean) => {
        if (isRead || !user?.email) return;
        try {
            await apiClient.put(`/notifications/${id}/read`, null, {
                params: { email: user.email }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handlePress = async (item: Notification) => {
        await markAsRead(item.id, item.isRead);

        if (item.type?.toUpperCase() === 'EVENT' && item.referenceId) {
            navigation.navigate('Main', { screen: 'EventDetail', params: { eventId: item.referenceId } } as any);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                {
                    backgroundColor: item.isRead ? theme.background : (isDarkColorScheme ? '#1e293b' : '#f0fdf4'),
                    borderColor: theme.border
                }
            ]}
            onPress={() => handlePress(item)}
        >
            <View style={styles.iconContainer}>
                {item.type === 'EVENT' ? (
                    <Ionicons name="calendar" size={24} color={theme.primary} />
                ) : (
                    <Ionicons name="notifications" size={24} color={theme.primary} />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.foreground }]}>{item.title}</Text>
                <Text style={[styles.message, { color: theme.mutedForeground }]} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={[styles.time, { color: theme.mutedForeground }]}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
            </View>
            {!item.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
            {loading && page === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color={theme.mutedForeground} />
                            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>No notifications yet</Text>
                        </View>
                    }
                    contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
});
