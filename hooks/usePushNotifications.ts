import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Behavior khi đang mở App (Foreground)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const notificationListener = useRef<Notifications.Subscription>(null as any);
    const responseListener = useRef<Notifications.Subscription>(null as any);

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

        // Bắt event khi app ĐANG MỞ
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        // Bắt event khi user CHẠM vào pop-up thông báo từ màn hình ngoài
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('User interacted with notification:', response);
            // Payload nằm trong: response.notification.request.content.data
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Quyền nhận thông báo bị từ chối!');
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log("🔥 Lấy thành công Expo Push Token: ", token);
        } catch (e) {
            console.log("Lỗi lấy Token Push Notification: ", e);
        }
    } else {
        console.log('Lưu ý: Push Notifications chỉ hoạt động trên Device thật, không chạy trên Simulator');
    }

    return token;
}
