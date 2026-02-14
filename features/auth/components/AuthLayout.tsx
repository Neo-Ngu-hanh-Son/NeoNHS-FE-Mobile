import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Image, StyleSheet, ViewStyle, StyleProp, Dimensions } from 'react-native';
import { ImageSourcePropType } from 'react-native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';

type AuthLayoutProps = {
  isLoading?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageSource?: ImageSourcePropType;
};

const deviceHeight = Dimensions.get('window').height;

export default function AuthLayout({
  isLoading = false,
  children,
  style,
  imageSource,
}: AuthLayoutProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <>
      <StatusBar
        style={isDarkColorScheme ? 'light' : 'dark'}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: theme.background }, style]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        extraScrollHeight={20}
        enableResetScrollToCoords={false}
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.imageContainer}>
          <Image
            source={imageSource || require('@/assets/images/Mountain.png')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View
          style={[
            styles.bottomContentWrapper,
            {
              backgroundColor: theme.card,
              shadowColor: isDarkColorScheme ? '#000' : '#000',
            },
          ]}>
          {children}
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    height: deviceHeight * 0.3,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomContentWrapper: {
    alignItems: 'center',
    marginTop: -50,
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    overflow: 'hidden',
  },
  formContainer: {
    width: '100%',
    flex: 1,
  },
});
