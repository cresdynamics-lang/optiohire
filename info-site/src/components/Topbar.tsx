"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "topbar-nav-link active" : "topbar-nav-link";
  };

  return (
    <header className="topbar" id="topbar">
      <button className="sidebar-toggle" id="sidebarToggle" style={{ display: "none" }}>
        <Menu size={20} />
      </button>
      
      <Link className="topbar-logo" href="/">
        <Image src="/logo.png" alt="OptioHire Logo" width={110} height={28} style={{ objectFit: 'contain' }} />
      </Link>
      
      <div className="topbar-sep"></div>
      
      <nav className="topbar-nav hidden md:flex">
        <Link href="/" className={isActive("/")}>Home</Link>
        <Link href="/blog" className={isActive("/blog")}>Blog</Link>
        <Link href="/tips" className={isActive("/tips")}>Hiring Tips</Link>
        <Link href="/guide" className={isActive("/guide")}>Guide</Link>
        <Link href="/api-docs" className={isActive("/api-docs")}>API & Integrations</Link>
      </nav>
      
      <div className="topbar-right">
        <Link href="https://optiohire.com/auth/signin" className="btn btn-ghost">
          Sign In
        </Link>
        <Link href="https://optiohire.com/auth/signup" className="btn btn-primary">
          Get Started →
        </Link>
      </div>
    </header>
  );
}
