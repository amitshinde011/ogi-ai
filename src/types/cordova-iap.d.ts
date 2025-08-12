// Minimal Cordova IAP globals so TS doesn't complain
export {};

declare global {
  interface Window {
    store?: any;
    cordova?: any;
  }
}
