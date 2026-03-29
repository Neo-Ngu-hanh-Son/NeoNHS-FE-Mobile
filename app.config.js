import 'dotenv/config';

export default {
  expo: {
    name: 'NeoNHS',
    slug: 'neonhs',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/NeoNHSLogo_Optimized.jpg',
    scheme: 'neonhs',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    splash: {
      image: './assets/images/NeoNHSLogo_Optimized.jpg',
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
        foregroundImage: './assets/images/NeoNHSLogo_Optimized.jpg',
        backgroundColor: '#ffffff',
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ],
    },

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
      [
        'expo-audio',
        {
          enableBackgroundPlayback: true,
        },
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location.",
          isAndroidBackgroundLocationEnabled: true,

        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "barcodeScannerEnabled": true
        }
      ]
    ],

    extra: {
      eas: {
        projectId: "ac061500-3be3-4ec9-b779-93680d9cbc39"
      }
    }
  },
};
