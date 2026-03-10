import type { Metadata } from "next";
import Providers from "@/components/layout/Providers";
import LayoutShell from "@/components/layout/LayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Arbeit - Find Right Jobs & Right Talent in India",
    template: "%s | Arbeit",
  },
  description:
    "Arbeit is India's leading recruitment agency specializing in permanent, contract and temporary placements across IT, Banking, AI & Data Science, and Agriculture sectors.",
  keywords: [
    "jobs in India",
    "recruitment agency India",
    "IT jobs",
    "banking jobs",
    "data science jobs",
    "contract staffing India",
    "hire talent India",
    "New Delhi recruitment",
  ],
  openGraph: {
    title: "Arbeit - Find Right Jobs & Right Talent",
    description:
      "India's leading recruitment agency for permanent, contract and temporary placements.",
    url: "https://www.arbeit.co.in",
    siteName: "Arbeit",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
