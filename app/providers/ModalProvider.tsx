import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

/**
 * Button configuration for modal
 */
export interface ModalButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Modal configuration options
 */
export interface ModalOptions {
  title?: string;
  message?: string;
  buttons?: ModalButton[];
  cancelable?: boolean; // Whether tapping outside dismisses the modal
}

/**
 * Modal context value
 */
interface ModalContextValue {
  /**
   * Show an alert modal with customizable buttons
   * Similar to React Native's Alert.alert()
   */
  alert: (
    title: string,
    message?: string,
    buttons?: ModalButton[],
    options?: { cancelable?: boolean }
  ) => void;

  /**
   * Show a confirmation modal with OK and Cancel buttons
   * Returns a promise that resolves to true if confirmed, false if cancelled
   */
  confirm: (title: string, message?: string) => Promise<boolean>;

  /**
   * Show a simple info modal with just an OK button
   */
  info: (title: string, message?: string) => void;

  /**
   * Dismiss the current modal
   */
  dismiss: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

/**
 * Modal Provider Component
 * Provides alert/confirm/info methods to show modals throughout the app
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({});
  const [promiseResolver, setPromiseResolver] = useState<((value: boolean) => void) | null>(null);

  const theme = THEME.light;

  const dismiss = useCallback(() => {
    setVisible(false);
    setOptions({});
    // If there's a pending promise (from confirm), resolve it as false
    if (promiseResolver) {
      promiseResolver(false);
      setPromiseResolver(null);
    }
  }, [promiseResolver]);

  const alert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: ModalButton[],
      alertOptions?: { cancelable?: boolean }
    ) => {
      const defaultButtons: ModalButton[] = buttons || [{ text: 'OK', style: 'default' }];

      setOptions({
        title,
        message,
        buttons: defaultButtons,
        cancelable: alertOptions?.cancelable ?? true,
      });
      setVisible(true);
    },
    []
  );

  const confirm = useCallback((title: string, message?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setPromiseResolver(() => resolve);
      setOptions({
        title,
        message,
        buttons: [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'OK', style: 'default', onPress: () => resolve(true) },
        ],
        cancelable: true,
      });
      setVisible(true);
    });
  }, []);

  const info = useCallback(
    (title: string, message?: string) => {
      alert(title, message, [{ text: 'OK', style: 'default' }], { cancelable: true });
    },
    [alert]
  );

  const handleButtonPress = useCallback((button: ModalButton) => {
    setVisible(false);
    setOptions({});
    setPromiseResolver(null);
    button.onPress?.();
  }, []);

  const handleBackdropPress = useCallback(() => {
    if (options.cancelable) {
      dismiss();
    }
  }, [options.cancelable, dismiss]);

  const getButtonTextStyle = (style?: ModalButton['style']) => {
    switch (style) {
      case 'destructive':
        return { color: theme.destructive };
      case 'cancel':
        return { color: theme.mutedForeground, fontWeight: '400' as const };
      default:
        return { color: theme.primary, fontWeight: '600' as const };
    }
  };

  const value: ModalContextValue = {
    alert,
    confirm,
    info,
    dismiss,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
        onRequestClose={handleBackdropPress}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.container, { backgroundColor: theme.card }]}>
                {options.title ? (
                  <Text style={[styles.title, { color: theme.foreground }]}>{options.title}</Text>
                ) : null}

                {options.message ? (
                  <Text style={[styles.message, { color: theme.mutedForeground }]}>
                    {options.message}
                  </Text>
                ) : null}

                {options.buttons && options.buttons.length > 0 ? (
                  <View
                    style={[
                      styles.buttonContainer,
                      options.buttons.length > 2 && styles.buttonContainerVertical,
                    ]}>
                    {options.buttons.map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          options.buttons!.length <= 2 && styles.buttonHorizontal,
                          options.buttons!.length > 2 && styles.buttonVertical,
                          index > 0 && options.buttons!.length <= 2 && styles.buttonBorderLeft,
                          index > 0 && options.buttons!.length > 2 && styles.buttonBorderTop,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}>
                        <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ModalContext.Provider>
  );
}

/**
 * Hook to access modal methods
 */
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    minWidth: 280,
    maxWidth: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHorizontal: {
    flex: 1,
  },
  buttonVertical: {
    width: '100%',
  },
  buttonBorderLeft: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonBorderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonText: {
    fontSize: 16,
  },
});
