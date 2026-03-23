import '@/components/globals.css'
import Providers from '@/components/providers'
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: "School Management System",
  description: "Experience an Amazing school management system with all tools and data required to manage a school",
  icons:{
    icons:"/public/assets/images/school.png"}
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
