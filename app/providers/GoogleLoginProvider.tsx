import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '755323177378-11nm4ungk8le19dtj6a0mlqfdiknhiot.apps.googleusercontent.com',
});

export default function GoogleLoginProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};