import "./globals.css";

export const metadata = {
  title: "Formbuilder",
  description: "Formbuilder SaaS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
