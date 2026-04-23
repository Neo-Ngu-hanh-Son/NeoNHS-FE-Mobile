import React, { ReactNode } from 'react';
import { Image, type ImageProps, type ImageSource } from 'expo-image';
import { ImageBackground, type ImageBackgroundProps, type ImageSourcePropType } from 'react-native';
import { cssInterop } from 'nativewind';

const DEFAULT_FALLBACK_SOURCE = require('@/assets/images/placeholder.jpg');

cssInterop(Image, {
  className: {
    target: 'style',
  },
});

function normalizeUri(uri?: string | null): string | null {
  if (typeof uri !== 'string') {
    return null;
  }

  const trimmed = uri.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type SmartImageProps = Omit<ImageProps, 'source'> & {
  uri?: string | null;
  fallbackSource?: ImageSource;
  className?: string;
};

/**
 * SmartImage — uses expo-image for network images (memory+disk caching,
 * efficient GIF/WebP decoding, crossfade transitions).
 * Falls back to a local placeholder when no valid URI is provided.
 */
export const SmartImage = React.memo(function SmartImage({
  uri,
  fallbackSource = DEFAULT_FALLBACK_SOURCE,
  style,
  className,
  ...props
}: SmartImageProps) {
  const resolvedUri = normalizeUri(uri);
  const source = resolvedUri ? { uri: resolvedUri } : fallbackSource;

  return (
    <Image
      source={source}
      className={className}
      style={style}
      cachePolicy="memory-disk"
      recyclingKey={resolvedUri ?? undefined}
      transition={200}
      contentFit="cover"
      {...props}
    />
  );
});

type SmartImageBackgroundProps = Omit<ImageBackgroundProps, 'source'> & {
  uri?: string | null;
  fallbackSource?: ImageSourcePropType;
  children?: ReactNode;
};

/**
 * SmartImageBackground — still uses RN ImageBackground since expo-image
 * doesn't expose an ImageBackground equivalent. Network images here
 * still benefit from RN's built-in caching.
 */
export function SmartImageBackground({
  uri,
  fallbackSource = DEFAULT_FALLBACK_SOURCE,
  children,
  ...props
}: SmartImageBackgroundProps) {
  const resolvedUri = normalizeUri(uri);
  const source = resolvedUri ? { uri: resolvedUri } : fallbackSource;

  return (
    <ImageBackground source={source} {...props}>
      {children}
    </ImageBackground>
  );
}
