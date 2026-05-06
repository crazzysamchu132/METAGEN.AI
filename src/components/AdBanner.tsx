import React, { useEffect, useRef } from 'react';

export const AdBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current) {
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

      // Append to the reference element
      bannerRef.current.appendChild(configScript);
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-8 border-t border-white/5 bg-black/20">
      <div 
        ref={bannerRef}
        className="overflow-hidden min-h-[90px] w-[728px] bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-widest border border-white/10"
      >
        {/* Ad will load here */}
        Advertisement
      </div>
    </div>
  );
};
