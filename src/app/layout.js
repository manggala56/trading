import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'Jurnal Trading',
  description: 'Aplikasi jurnal trading terintegrasi dengan webhook TradingView.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
      
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>
          {`
            body {
              font-family: 'Inter', sans-serif;
            }
          `}
        </style>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
