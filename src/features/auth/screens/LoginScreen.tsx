import { Button, Text, View } from "@ant-design/react-native";
import { useAuth } from "../context/AuthContext";
import { logger } from "@/utils/logger";
import LoadingOverlay from "@/components/Loader/LoadingOverlay";

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const handleLogin = async () => {
        try {
            await login({ email: "test@example.com", password: "password" });
        } catch (error) {
            logger.error(error);
        }
    };

    return (
        <View>
            <LoadingOverlay visible={isLoading} message="Logging in..." />
            <Text>Login screen</Text>
            <Button onPress={handleLogin} type="primary">Press here to login</Button>
        </View>
    );
}
