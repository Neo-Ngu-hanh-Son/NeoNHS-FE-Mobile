import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import { AlertModalOptions, ConfirmationModalOptions, InfoModalOptions } from '../types';

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
  cancelable?: boolean;
}

/**
 * Modal context value
 */
interface ModalContextValue {
  alert: (options: AlertModalOptions) => void;
  confirm: (options: ConfirmationModalOptions) => Promise<boolean>;
  info: (options: InfoModalOptions) => void;
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
  const { isDarkColorScheme } = useTheme();

  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const separatorColor = isDarkColorScheme ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.1)';
  const backdropColor = isDarkColorScheme ? 'rgba(0, 0, 0, 0.58)' : 'rgba(0, 0, 0, 0.4)';

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
    (options: AlertModalOptions) => {
      const defaultButtons: ModalButton[] = options.buttons || [{ text: 'OK', style: 'default' }];

      setOptions({
        title: options.title,
        message: options.message,
        buttons: defaultButtons,
        cancelable: options?.cancelable ?? true,
      });
      setVisible(true);
    },
    []
  );

  /**
   * Show a confirmation modal with OK and Cancel buttons
   * Returns a promise and executes optional callbacks
   */
  const confirm = useCallback((
    options: ConfirmationModalOptions
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const title = options.title;
      const message = options.message;
      const confirmOptions = { onOk: options.onOk, onCancel: options.onCancel };
      setPromiseResolver(() => resolve);
      setOptions({
        title,
        message,
        buttons: options.buttons || [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              confirmOptions?.onCancel?.();
              resolve(false);
            }
          },
          {
            text: 'OK',
            style: 'default',
            onPress: () => {
              confirmOptions?.onOk?.();
              resolve(true);
            }
          },
        ],
        cancelable: true,
      });
      setVisible(true);
    });
  }, []);

  /**
   * Show a simple info modal with just an OK button and optional callback
   */
  const info = useCallback(
    (options: InfoModalOptions) => {
      alert(
        {
          title: options.title,
          message: options.message,
          buttons: [{
            text: 'OK',
            style: 'default',
            onPress: options.onOk
          }],
          cancelable: options.cancelable ?? true
        }
      );
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

  const value: ModalContextValue = useMemo(
    () => ({
      alert,
      confirm,
      info,
      dismiss,
    }),
    [alert, confirm, info, dismiss]
  );

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
          <View style={[styles.backdrop, { backgroundColor: backdropColor }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.container, { backgroundColor: theme.card }]}>
                {options.title ? (
                  <Text style={[styles.title, { color: theme.foreground }]}>{options.title}</Text>
                ) : null}

                {options.message ? (
                  <Text style={[styles.message, { color: theme.mutedForeground }]}>{options.message}</Text>
                ) : null}

                {options.buttons && options.buttons.length > 0 ? (
                  <View
                    style={[
                      styles.buttonContainer,
                      { borderTopColor: separatorColor },
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
                          index > 0 && options.buttons!.length <= 2 && { borderLeftColor: separatorColor },
                          index > 0 && options.buttons!.length > 2 && styles.buttonBorderTop,
                          index > 0 && options.buttons!.length > 2 && { borderTopColor: separatorColor },
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}>
                        <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>{button.text}</Text>
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
  },
  buttonBorderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buttonText: {
    fontSize: 16,
  },
});
