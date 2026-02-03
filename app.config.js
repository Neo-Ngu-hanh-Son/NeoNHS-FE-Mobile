import 'dotenv/config';

export default {
  expo: {
    name: 'NeoNHS',
    slug: 'neonhs',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/NeoNHSLogo.png',
    scheme: 'neonhs',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    splash: {
      image: './assets/images/NeoNHSLogo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
    },

    android: {
      package: 'com.neonhs.app',
      versionCode: 1,
      versionName: '1.0.0',
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/NeoNHSLogo.png',
        backgroundColor: '#ffffff',
      },
    },

    permissions: ['ACCESS_FINE_LOCATION'],

    plugins: [
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.somerandomkey',
        },
      ],
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: 'YOUR_KEY_HERE',
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAP_API,
        },
      ],
    ],
  },
};
