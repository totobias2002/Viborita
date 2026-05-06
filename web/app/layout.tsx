import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viborita | Reservas para padel",
  description: "Reserva turnos de padel y gestiona complejos desde la web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
