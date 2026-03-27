import React, { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  type ImageBackgroundProps,
  type ImageProps,
  type ImageSourcePropType,
} from 'react-native';

const DEFAULT_FALLBACK_SOURCE = require('@/assets/images/placeholder.jpg');

function normalizeUri(uri?: string | null): string | null {
  if (typeof uri !== 'string') {
    return null;
  }

  const trimmed = uri.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type SmartImageProps = Omit<ImageProps, 'source'> & {
  uri?: string | null;
  fallbackSource?: ImageSourcePropType;
};

export function SmartImage({
  uri,
  fallbackSource = DEFAULT_FALLBACK_SOURCE,
  ...props
}: SmartImageProps) {
  const resolvedUri = normalizeUri(uri);
  const source = resolvedUri ? { uri: resolvedUri } : fallbackSource;

  return <Image source={source} {...props} />;
}

type SmartImageBackgroundProps = Omit<ImageBackgroundProps, 'source'> & {
  uri?: string | null;
  fallbackSource?: ImageSourcePropType;
  children?: ReactNode;
};

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
