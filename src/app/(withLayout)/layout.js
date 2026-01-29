// layout.js
import Header from "@/components/Layout/Header";

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
