import React from 'react';
import { Alert, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Share, { Social, type ShareSingleOptions } from 'react-native-share';

import { useTheme } from '@/app/providers/ThemeProvider';

type SocialSharePlatform = 'facebook' | 'x' | 'instagram';

type CheckinSocialShareActionsProps = {
  destinationName?: string;
  hashtags?: string[];
  imageUrls?: string[];
};

const DEFAULT_HASHTAGS = ['NeoNHS', 'DaNang'];

async function openFirstAvailableUrl(urls: string[]) {
  for (const url of urls) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // Try the next fallback URL.
    }
  }

  return false;
}

export function CheckinSocialShareActions({ destinationName, hashtags, imageUrls }: CheckinSocialShareActionsProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const resolvedHashtags = hashtags && hashtags.length > 0 ? hashtags : DEFAULT_HASHTAGS;
  const resolvedImageUrls = (imageUrls ?? []).filter((url): url is string => typeof url === 'string' && !!url.trim());
  const primaryImageUrl = resolvedImageUrls[0];
  const hashtagsText = resolvedHashtags.map((tag) => `#${tag}`).join(' ');
  const shareMessage = `I just checked in at ${destinationName || 'NeoNHS'} with NeoNHS! ${hashtagsText}`;
  const encodedShareMessage = encodeURIComponent(shareMessage);
  const fallbackLink = 'https://neonhs.com';
  const encodedFallbackLink = encodeURIComponent(fallbackLink);
  const facebookWebShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedFallbackLink}&quote=${encodedShareMessage}`;

  const isCancelledShareError = (error: unknown) => {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: string }).message ?? '')
        : '';

    return message.toLowerCase().includes('cancel');
  };

  const shareViaNativeApp = async (platform: SocialSharePlatform) => {
    const optionByPlatform: Record<SocialSharePlatform, ShareSingleOptions> = {
      facebook: {
        social: Social.Facebook,
        message: shareMessage,
        url: primaryImageUrl || fallbackLink,
      },
      x: {
        social: Social.Twitter,
        message: shareMessage,
        url: primaryImageUrl || fallbackLink,
      },
      instagram: {
        social: Social.Instagram,
        message: shareMessage,
        url: primaryImageUrl,
        type: 'image/*',
      },
    };

    try {
      const result = await Share.shareSingle(optionByPlatform[platform]);
      if (!result.success && isCancelledShareError(result.message)) {
        return true;
      }
      return result.success;
    } catch (error) {
      if (isCancelledShareError(error)) {
        return true;
      }
      return false;
    }
  };

  const handleShareToPlatform = async (platform: SocialSharePlatform) => {
    if (platform === 'instagram' && !primaryImageUrl) {
      Alert.alert('No image available', 'Capture at least one photo to share on Instagram.');
      return;
    }

    const sharedInNativeApp = await shareViaNativeApp(platform);
    if (sharedInNativeApp) {
      if (platform === 'instagram') {
        Alert.alert('Instagram opened', `Instagram may ignore caption prefill. Suggested caption:\n\n${shareMessage}`);
      }
      return;
    }

    const shareTargets: Record<SocialSharePlatform, string[]> = {
      facebook: [`fb://facewebmodal/f?href=${encodeURIComponent(facebookWebShareUrl)}`, facebookWebShareUrl],
      x: [`twitter://post?message=${encodedShareMessage}`, `https://x.com/intent/tweet?text=${encodedShareMessage}`],
      instagram: ['instagram://camera', 'https://www.instagram.com/'],
    };

    const didOpen = await openFirstAvailableUrl(shareTargets[platform]);

    if (!didOpen) {
      Alert.alert('Unable to open app', `Could not open ${platform}. Please check if it is installed.`);
      return;
    }

    if (platform === 'instagram') {
      Alert.alert(
        'Instagram opened',
        `Instagram does not allow apps to prefill post captions directly. Copy this caption:\n\n${shareMessage}`
      );
    }
  };

  const handleOpenShareMenu = () => {
    Alert.alert('Share your check-in', 'Choose an app', [
      {
        text: 'Facebook',
        onPress: () => {
          void handleShareToPlatform('facebook');
        },
      },
      {
        text: 'X',
        onPress: () => {
          void handleShareToPlatform('x');
        },
      },
      {
        text: 'Instagram',
        onPress: () => {
          void handleShareToPlatform('instagram');
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={handleOpenShareMenu}
      accessibilityRole="button"
      accessibilityLabel="Share check-in"
      className="h-10 w-10 items-center justify-center rounded-full bg-muted/50">
      <Ionicons name="share-social" size={20} color={theme.foreground} />
    </TouchableOpacity>
  );
}
