'use client';

import { useEffect } from 'react';

export default function HomeParallax() {
  useEffect(() => {
    const handleScroll = () => {
      const layers = document.querySelectorAll<HTMLElement>('.parallax-layer');
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed || '0');
        layer.style.transform = `translateY(${window.scrollY * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
