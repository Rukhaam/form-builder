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


const BASE_URL = "https://formbuilder.summitdigital.in";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FormBuilder — Build Beautiful Forms That Convert",
    template: "%s | FormBuilder",
  },
  description:
    "Create stunning, responsive forms in minutes with FormBuilder. Drag-and-drop builder, AI-powered form generation, real-time analytics, and seamless public sharing — no code required.",
  keywords: [
    "form builder",
    "online form creator",
    "drag and drop forms",
    "survey builder",
    "AI form generator",
    "form templates",
    "contact form builder",
    "feedback form",
    "form analytics",
    "no-code forms",
    "public forms",
    "SaaS form builder",
  ],
  authors: [{ name: "FormBuilder by Summit Digital" }],
  creator: "Summit Digital",
  publisher: "Summit Digital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "FormBuilder",
    title: "FormBuilder — Build Beautiful Forms That Convert",
    description:
      "Create stunning, responsive forms in minutes. Drag-and-drop builder, AI-powered generation, real-time analytics, and seamless sharing.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "FormBuilder — Build Beautiful Forms That Convert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormBuilder — Build Beautiful Forms That Convert",
    description:
      "Create stunning, responsive forms in minutes. Drag-and-drop builder, AI-powered generation, real-time analytics, and seamless sharing.",
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "Technology",
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
