import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = {
  title: "Administrácia",
  description: "Interná správa Fitlineru",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
