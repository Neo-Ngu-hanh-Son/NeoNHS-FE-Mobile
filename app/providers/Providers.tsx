import { AuthProvider } from "@/features/auth";
import ApiProvider from "./ApiProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GoogleLoginProvider from "./GoogleLoginProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleLoginProvider>
      <ThemeProvider>
        <AuthProvider>
          <ApiProvider>
            <SafeAreaProvider>
              {children}
            </SafeAreaProvider>
          </ApiProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleLoginProvider>
  );
}
