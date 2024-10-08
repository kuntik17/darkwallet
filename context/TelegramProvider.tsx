// TelegramProvider
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ITelegramUser, IWebApp } from "../types/types";

export interface ITelegramContext {
  webApp?: IWebApp;
  user?: ITelegramUser;
  initData?: string;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [webApp, setWebApp] = useState<IWebApp | null>(null);

  useEffect(() => {
    const app = (window as any).Telegram?.WebApp;
    if (app) {
      app.ready();
      setWebApp(app);
    }
  }, []);

  const value = useMemo(() => {
    return webApp
      ? {
          webApp,
          unsafeData: webApp.initDataUnsafe,
          user: webApp.initDataUnsafe.user,
          initData: webApp.initData,
        }
      : {};
  }, [webApp]);

  return (
    <TelegramContext.Provider value={value}>
      {/* Make sure to include script tag with "beforeInteractive" strategy to pre-load web-app script */}
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
