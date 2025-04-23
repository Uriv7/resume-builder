'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    try {
      let theme = localStorage.getItem('theme');
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
      }
      document.documentElement.classList.add(theme);
    } catch (e) {
      console.error('Error initializing theme:', e);
    }
  }, []);

  return null;
}
