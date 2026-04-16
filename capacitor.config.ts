import { CapacitorConfig } from '@capacitor/cli';

const remoteUrl = process.env.WEB_URL?.trim();

const config: CapacitorConfig = {
  appId: 'com.subculturecalendar.app',
  appName: '서브컬처 행사 캘린더',
  webDir: 'www',
  server: remoteUrl
    ? {
        url: remoteUrl,
        cleartext: false,
        androidScheme: 'https',
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      showSpinner: false,
    },
  },
};

export default config;
