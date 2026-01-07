import AntDesignProvider from "./AntDesignProvider";
import { AuthProvider } from "@/features/auth";
import ApiProvider from "./ApiProvider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AntDesignProvider>
      <AuthProvider>
        <ApiProvider>{children}</ApiProvider>
      </AuthProvider>
    </AntDesignProvider>
  );
}
