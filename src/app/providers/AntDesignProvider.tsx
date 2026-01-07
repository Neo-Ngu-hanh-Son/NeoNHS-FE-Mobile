import { theme } from "@/theme/colors";
import { Provider } from "@ant-design/react-native";
import { ReactNode } from "react";

export default function AntDesignProvider({ children }: { children: ReactNode }) {
  return <Provider theme={theme}>{children}</Provider>;
}
