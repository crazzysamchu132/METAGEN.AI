import React, { useEffect, useRef } from 'react';

export const AdBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current) {
      // Clear previous content to avoid duplicates on re-render
      bannerRef.current.innerHTML = '';
      
      const container = document.createElement('div');
      container.id = 'ad-container-' + Math.random().toString(36).substr(2, 9);
      bannerRef.current.appendChild(container);

      // Create the configuration script
      const configScript = document.createElement('script');
      configScript.text = `
        atOptions = {
          'key' : 'c15b77d9141a80cc8e53948340779af3',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      // Create the external script
      const invokeScript = document.createElement('script');
      invokeScript.src = 'https://www.highperformanceformat.com/c15b77d9141a80cc8e53948340779af3/invoke.js';
      invokeScript.async = true;

      container.appendChild(configScript);
      container.appendChild(invokeScript);
    }
    
    return () => {
      if (bannerRef.current) {
        bannerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center py-8 border-t border-white/5 bg-black/20">
      <div 
        ref={bannerRef}
        className="overflow-hidden min-h-[90px] w-full max-w-[728px] bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-widest border border-white/10"
      >
        Advertisement
      </div>
    </div>
  );
};
