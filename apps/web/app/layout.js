import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans",
});
import { TrpcProvider } from "@/components/TrpcProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { Toaster } from "react-hot-toast";
import { ChatWidget } from "@/components/ui/ChatWidget"; 


export const metadata = {
  title: "FormBuilder",
  description: "Create and share forms easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <ReduxProvider>
          <TrpcProvider>
            {children}
            <ChatWidget /> {/* 🚀 Mount here */}
          </TrpcProvider>
        </ReduxProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
