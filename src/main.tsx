import './index.css';
import './assets/fonts/Geist-Black.ttf';
import './assets/fonts/Geist-Bold.ttf';
import './assets/fonts/Geist-ExtraBold.ttf';
import './assets/fonts/Geist-ExtraLight.ttf';
import './assets/fonts/Geist-Light.ttf';
import './assets/fonts/Geist-Medium.ttf';
import './assets/fonts/Geist-Regular.ttf';
import './assets/fonts/Geist-SemiBold.ttf';
import './assets/fonts/Geist-Thin.ttf';

import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { loadConfig } from './config/index.ts';

console.group(import.meta.env.VITE_APP_MODE);
console.group(import.meta.env.BASE_URL);

loadConfig().then(async () => {
  const App = (await import('./app/App.tsx')).default;
  axios.defaults.withCredentials = true;

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
