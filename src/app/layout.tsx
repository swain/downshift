import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { AuthScreen } from "../components/AuthScreen";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Downshift",
  description: "Track your nutrition with self-sovereign accounts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cook = await cookies();
  const accountKey = cook.get("account_key");

  return (
    <html lang="en">
      <body className={lato.variable}>
        {accountKey ? children : <AuthScreen />}
      </body>
    </html>
  );
}
