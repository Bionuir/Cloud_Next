import { CssBaseline } from '@mui/material';
import { Geist, Geist_Mono } from "next/font/google";
import ThemeRegistry from './ThemeRegistry';
import theme from './theme';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Clinova',
  description: 'Tu sitio de confianza para agendar sesiones con terapeutas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <CssBaseline />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
