import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const configureStatusBar = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Allow web content to render under the status bar for manual control
      await StatusBar.setOverlaysWebView({ overlay: false });

      // Optional: You can also customize the style
      await StatusBar.setStyle({ style: Style.Dark });

      // Optional: Set background color (if needed)
      // await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (err) {
      console.warn('Failed to configure StatusBar:', err);
    }
  }
};

configureStatusBar();

createRoot(document.getElementById("root")!).render(<App />);
