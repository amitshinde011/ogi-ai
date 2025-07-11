export interface StepCounterPlugin {
  /**
   * Initialize the step counter and request permissions
   */
  initialize(): Promise<{ success: boolean }>;

  /**
   * Get current step count for today
   */
  getTodaySteps(): Promise<{ steps: number }>;

  /**
   * Start listening to step counter updates
   */
  startListening(): Promise<{ success: boolean }>;

  /**
   * Stop listening to step counter updates
   */
  stopListening(): Promise<{ success: boolean }>;

  /**
   * Check if step counting is supported on this device
   */
  isSupported(): Promise<{ supported: boolean }>;

  /**
   * Request necessary permissions for step counting
   */
  requestPermissions(): Promise<{ granted: boolean }>;

  /**
   * Add a listener for step count updates
   */
  addListener(
    eventName: 'stepUpdate',
    listenerFunc: (data: { steps: number; timestamp: number }) => void,
  ): Promise<any>;

  /**
   * Remove all listeners
   */
  removeAllListeners(): Promise<void>;
}