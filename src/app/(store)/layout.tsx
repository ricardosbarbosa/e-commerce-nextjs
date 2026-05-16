"use client";

import MobileMenu from "./_components/MobileMenu";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white">
      <MobileMenu open={open} setOpen={setOpen} />
      <Header setOpen={setOpen} />
      <main className="mx-auto mt-8 max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
