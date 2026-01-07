import RootNavigator from "./navigations/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Providers } from "./providers/Providers";

export default function App() {
    return (
        <Providers>
            <SafeAreaProvider>
                <StatusBar style="auto" />
                <RootNavigator />
            </SafeAreaProvider>
        </Providers>
    );
}