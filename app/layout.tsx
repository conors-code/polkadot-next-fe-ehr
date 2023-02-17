import '../styles/globals.css';
import EHRContextProvider from './context/EHRContextProvider';
import Header from './Header';
import ProviderDB from './ProviderDB';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Header />
        <EHRContextProvider>
            {children}
        </EHRContextProvider>
        <ProviderDB/>
      </body>
    </html>
  )
}
