import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { THEME } from '@/lib/theme';

type ThemeType = typeof THEME.dark | typeof THEME.light;

const CustomTabBarButton = ({
  children,
  theme,
  onPress,
  ...props
}: {
  children: React.ReactNode;
  theme: ThemeType;
  onPress: any;
}) => {
  return (
    <TouchableOpacity {...props} style={styles.customButtonContainer} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.customButton, { backgroundColor: theme.primary }]}>{children}</View>
    </TouchableOpacity>
  );
};

export default CustomTabBarButton;

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -24, // Pulls the button upwards to overflow the UI
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    // Elevation for Android
    elevation: 5,
  },
  customButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
