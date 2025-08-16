// Minimal globals to silence TS and give intellisense
export {};

declare global {
  interface Window {
    store?: any;
    cordova?: any;
    Capacitor?: any;
  }
}
