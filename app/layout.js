// app/layout.js

import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ThemeScript from "./components/ThemeScript";

export const metadata = {
  title: "ResumePilot - Professional Resume Builder",
  description: "Create professional resumes with AI assistance or build them manually",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
        <ThemeScript />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}