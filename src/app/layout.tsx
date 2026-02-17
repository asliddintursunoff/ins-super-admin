import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "INS Grades Admin",
  description: "Admin panel for INS grades system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
