import React from "react";

export function Footer() {
  return (
    <footer className="w-full py-6 px-4 md:px-8 border-t border-primary/20 bg-black/50 backdrop-blur-sm mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-widest uppercase text-muted-foreground">
        <span>© 2026 INFRALYZER - VERSION 1.0.0</span>
        <a
          href="https://github.com/matheusjfa"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors flex items-center gap-2"
        >
          <span className="text-primary">{'>'}</span> DEVELOPED BY MATHEUSJFA
        </a>
      </div>
    </footer>
  );
}
