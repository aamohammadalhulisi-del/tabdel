import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
