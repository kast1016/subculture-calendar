import { CapacitorConfig } from '@capacitor/cli';

const remoteUrl = process.env.WEB_URL?.trim() || 'https://your-website.example.com';

const config: CapacitorConfig = {
  appId: 'com.subculturecalendar.app',
  appName: '서브컬처 행사 캘린더',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: remoteUrl,
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      showSpinner: false,
    },
  },
};

export default config;
