import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 px-4 border-t border-white/5 bg-black/40 text-center">
      <div className="container mx-auto">
        <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} METAGEN.AI • ALL RIGHTS RESERVED BY <span className="text-white font-bold">ORNATECH CORPORATION</span>
        </p>
      </div>
    </footer>
  );
};
