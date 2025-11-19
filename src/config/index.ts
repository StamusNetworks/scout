export type Configuration = {
  apiUrl: string;
};

declare global {
  interface Window {
    config: Configuration;
  }
}

export const loadConfig = () =>
  fetch(
    import.meta.env.VITE_APP_MODE === 'development'
      ? '/config.json'
      : import.meta.env.BASE_URL + 'config.json',
  )
    .then((res) => res.json())
    .then((conf) => {
      window.config = conf;
    });

export const getConfig = () => window.config;
