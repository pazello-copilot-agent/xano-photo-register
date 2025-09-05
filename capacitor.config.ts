import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f2ebc708bfe54e41a6b37ec77eb0e237',
  appName: 'xano-photo-register',
  webDir: 'dist',
  server: {
    url: 'https://f2ebc708-bfe5-4e41-a6b3-7ec77eb0e237.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      requestPermissions: true
    }
  }
};

export default config;