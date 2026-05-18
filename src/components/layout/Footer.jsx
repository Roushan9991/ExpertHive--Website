import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full py-xl px-lg flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="flex flex-col items-center md:items-start gap-sm">
        <span className="font-h3 text-h3 text-primary">ExpertHive</span>
        <span className="font-caption text-caption text-on-surface-variant">© 2026 ExpertHive. All rights reserved.</span>
      </div>
      <div className="flex flex-wrap justify-center gap-lg">
        <a href="#" className="font-caption text-caption text-on-surface-variant hover:underline opacity-80 hover:opacity-100">Services</a>
        <a href="#" className="font-caption text-caption text-on-surface-variant hover:underline opacity-80 hover:opacity-100">FAQs</a>
        <a href="#" className="font-caption text-caption text-on-surface-variant hover:underline opacity-80 hover:opacity-100">Privacy Policy</a>
        <a href="#" className="font-caption text-caption text-on-surface-variant hover:underline opacity-80 hover:opacity-100">Contact</a>
      </div>
    </footer>
  );
};
