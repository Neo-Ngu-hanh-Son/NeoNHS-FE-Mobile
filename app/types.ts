export interface InfoModalOptions {
  title: string;
  message: string;
  onOk?: () => void;
  cancelable?: boolean
}

export interface ConfirmationModalOptions {
  title: string;
  message: string;
  onOk?: () => void;
  onCancel?: () => void;
  buttons?: ModalButton[];
}

export interface AlertModalOptions {
  title: string,
  message?: string,
  buttons?: ModalButton[],
  cancelable?: boolean
}

export interface ModalButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}