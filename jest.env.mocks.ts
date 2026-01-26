// // import '@testing-library/jest-native/extend-expect';

// CRITICAL: Set up NativeWind's required global BEFORE any mocks run
// Jest hoists jest.mock() calls, but this IIFE runs during module evaluation
// which happens before the mock factories execute
(function() {
    // @ts-ignore - This global is set by NativeWind at runtime
    if (typeof globalThis !== 'undefined' && !globalThis._ReactNativeCSSInterop) {
        // @ts-ignore
        globalThis._ReactNativeCSSInterop = {
            cssInterop: function(component: any) { return component; }
        };
    }
    // Also set it on global for compatibility
    if (typeof global !== 'undefined' && !global._ReactNativeCSSInterop) {
        // @ts-ignore
        global._ReactNativeCSSInterop = globalThis._ReactNativeCSSInterop;
    }
})();

// Don't mock react-native here - jest-expo preset already handles it
// If you need to override useColorScheme, do it in jest.setup.ts or in individual tests

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

// Add this before your other mocks
jest.mock('expo-font', () => ({
    __esModule: true,
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true),
    isLoading: jest.fn(() => false),
}));

// Mock the entire @expo/vector-icons module more completely
// Use jest-expo's mocked react-native instead of requiring actual
jest.mock('@expo/vector-icons', () => {
    const React = jest.requireActual('react');
    // Use the mocked Text from jest-expo, not the actual one
    const Text = 'Text'; // Simple string mock to avoid native module issues

    const createIconComponent = (name: string) => {
        return React.forwardRef((props: any, ref: any) => {
            return React.createElement(Text, {
                ...props,
                ref,
                testID: props.testID || `${name}-icon`,
            }, props.name || '');
        });
    };

    return {
        __esModule: true,
        Ionicons: createIconComponent('Ionicons'),
        MaterialIcons: createIconComponent('MaterialIcons'),
        FontAwesome: createIconComponent('FontAwesome'),
        MaterialCommunityIcons: createIconComponent('MaterialCommunityIcons'),
        Feather: createIconComponent('Feather'),
        AntDesign: createIconComponent('AntDesign'),
        Entypo: createIconComponent('Entypo'),
    };
});

jest.mock('react-native/Libraries/Image/Image', () => 'Image');
jest.mock('react-native/Libraries/Image/ImageBackground', () => 'ImageBackground');

jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });