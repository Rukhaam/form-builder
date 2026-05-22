import { TrpcProvider } from '../components/TrpcProvider.js';
import { ReduxProvider } from '../components/ReduxProvider.jsx';
import { Toaster } from 'react-hot-toast'; // <-- 1. Import
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>
          <ReduxProvider>
            {children}
            <Toaster position="bottom-right" /> 
          </ReduxProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}