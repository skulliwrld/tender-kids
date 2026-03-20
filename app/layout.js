import '@/components/globals.css'
import Providers from '@/components/providers'

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
      </body>
    </html>
  );
}
