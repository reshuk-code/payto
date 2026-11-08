import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: { default: 'QRForge: QR codes that never expire', template: '%s · QRForge' },
  description:
    'Create dynamic QR codes you can edit after printing. Change the link anytime and see who scans. Free codes never expire.',
};

export const viewport = { themeColor: '#fafaf9' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
