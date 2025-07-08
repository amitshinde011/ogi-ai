import { WebPlugin } from '@capacitor/core';
import type { StepCounterPlugin } from './definitions';

export class StepCounterWeb extends WebPlugin implements StepCounterPlugin {
  async initialize(): Promise<{ success: boolean }> {
    console.log('StepCounter: Web platform - initialize called');
    return { success: false };
  }

  async getTodaySteps(): Promise<{ steps: number }> {
    console.log('StepCounter: Web platform - getTodaySteps called');
    return { steps: 0 };
  }

  async startListening(): Promise<{ success: boolean }> {
    console.log('StepCounter: Web platform - startListening called');
    return { success: false };
  }

  async stopListening(): Promise<{ success: boolean }> {
    console.log('StepCounter: Web platform - stopListening called');
    return { success: false };
  }

  async isSupported(): Promise<{ supported: boolean }> {
    console.log('StepCounter: Web platform - not supported');
    return { supported: false };
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    console.log('StepCounter: Web platform - requestPermissions called');
    return { granted: false };
  }
}