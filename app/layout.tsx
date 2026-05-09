import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { I18nProvider } from "@/components/i18n-provider";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Kids English Trainer",
  description: "PWA-приложение для семейного изучения английского",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#7ed7c1",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <I18nProvider>
          <PwaRegister />
          <AppChrome>{children}</AppChrome>
        </I18nProvider>
      </body>
    </html>
  );
}
