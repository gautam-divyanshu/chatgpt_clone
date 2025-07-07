import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ConversationProvider } from "@/components/providers/ConversationProvider";
import { StreamingProvider } from "@/components/providers/StreamingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "created by Divyanshu Gautam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConversationProvider>
            <StreamingProvider>
              {children}
            </StreamingProvider>
          </ConversationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
