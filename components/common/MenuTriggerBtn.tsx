import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Modal, TouchableWithoutFeedback, Dimensions, Animated, Platform } from 'react-native';
import { Text } from '../ui/text';
import { cn } from '@/lib/utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuItem {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  isDestructive?: boolean;
}

export default function SmartMenu({ trigger, items }: { trigger: React.ReactNode, items: MenuItem[] }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View>(null);

  const openMenu = () => {
    // PageX and PageY are location of the element on the screen (not relative)
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const menuWidth = 200;
      const menuHeight = items.length * 48; // Compact native height
      const gap = 4;

      let top = pageY + height + gap;
      let left = pageX + width - menuWidth;

      // If too high, set to bottom
      if (top + menuHeight > SCREEN_HEIGHT) {
        top = pageY - menuHeight - gap;
      }

      // If too right, set to left
      if (left + menuWidth > SCREEN_WIDTH) {
        left = SCREEN_WIDTH - menuWidth;
      }

      setCoords({ top, left, width });
      setVisible(true);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 250,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeMenu = (callback?: () => void) => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      scaleAnim.setValue(0.92);
      if (callback) callback();
    });
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity onPress={openMenu} activeOpacity={0.7}>
          {trigger}
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => closeMenu()}>
          {/* subtle backdrop dim based on theme */}
          <View className="flex-1 bg-black/5 dark:bg-black/20">
            <Animated.View
              // Using your theme variables for background and border
              className="absolute bg-popover rounded-xl border border-border shadow-xl"
              style={{
                top: coords.top,
                left: coords.left,
                width: 200,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                  },
                  android: { elevation: 6 }
                })
              }}
            >
              <View className="py-1">
                {items.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => closeMenu(item.onPress)}
                    // active:bg-muted uses your 210 20% 90% variable
                    className="flex-row items-center justify-between px-4 py-3 active:bg-muted"
                  >
                    <Text
                      style={{ fontSize: 15 }}
                      className={cn(
                        "font-medium",
                        item.isDestructive ? "text-destructive" : "text-popover-foreground"
                      )}
                    >
                      {item.label}
                    </Text>

                    {item.icon && (
                      <View className="ml-3 items-center justify-center opacity-80">
                        {item.icon}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}