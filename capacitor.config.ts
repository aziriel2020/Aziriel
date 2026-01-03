import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mariokart.racing',
  appName: 'Mario Kart 3D',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
