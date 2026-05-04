import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

export function DeepLinkProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const { path } = Linking.parse(url);

      if (!path) return;

      // Example routing
      if (path.startsWith('blog/')) {
        const id = path.split('/')[1];
        navigation.navigate('Main', {
          screen: 'BlogDetails',
          params: { blogId: id },
        });
      }

      if (path.startsWith('event/')) {
        const id = path.split('/')[1];
        navigation.navigate('Main', {
          screen: 'EventDetail',
          params: { eventId: id },
        });
      }

      if (path.startsWith('workshop/')) {
        const id = path.split('/')[1];
        navigation.navigate('Main', {
          screen: 'WorkshopDetail',
          params: { workshopId: id },
        });
      }

      if (path.startsWith('point/')) {
        const id = path.split('/')[1];
        navigation.navigate('Main', {
          screen: 'PointDetail',
          params: { pointId: id },
        });
      }
    };

    // Cold start
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    // Runtime
    const sub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => sub.remove();
  }, [navigation]);

  return children;
}