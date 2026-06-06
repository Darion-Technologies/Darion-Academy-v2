import type { Metadata } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";

export const metadata: Metadata = {
  title: { default: "Darion Academy", template: "%s | Darion Academy" },
  description: "Darion Technologies internal learning workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><NavigationProgress />{children}</body>
    </html>
  );
}
