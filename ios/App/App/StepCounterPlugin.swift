import Foundation
import Capacitor
import CoreMotion
import HealthKit

@objc(StepCounterPlugin)
public class StepCounterPlugin: CAPPlugin {
    private var pedometer = CMPedometer()
    private var healthStore = HKHealthStore()
    private var isListening = false
    private var todaySteps = 0
    
    @objc func initialize(_ call: CAPPluginCall) {
        if !CMPedometer.isStepCountingAvailable() {
            call.resolve(["success": false])
            return
        }
        
        // Request HealthKit permissions for more accurate data
        if HKHealthStore.isHealthDataAvailable() {
            let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
            healthStore.requestAuthorization(toShare: [], read: [stepType]) { success, error in
                DispatchQueue.main.async {
                    call.resolve(["success": success])
                }
            }
        } else {
            call.resolve(["success": true])
        }
    }
    
    @objc func getTodaySteps(_ call: CAPPluginCall) {
        call.resolve(["steps": todaySteps])
    }
    
    @objc func startListening(_ call: CAPPluginCall) {
        if !CMPedometer.isStepCountingAvailable() {
            call.resolve(["success": false])
            return
        }
        
        if !isListening {
            let calendar = Calendar.current
            let startOfDay = calendar.startOfDay(for: Date())
            
            // Use CoreMotion for real-time step counting
            pedometer.startUpdates(from: startOfDay) { [weak self] data, error in
                guard let self = self, let data = data else { return }
                
                DispatchQueue.main.async {
                    self.todaySteps = data.numberOfSteps.intValue
                    
                    // Notify listeners
                    self.notifyListeners("stepUpdate", data: [
                        "steps": self.todaySteps,
                        "timestamp": Date().timeIntervalSince1970 * 1000
                    ])
                }
            }
            
            isListening = true
        }
        
        call.resolve(["success": true])
    }
    
    @objc func stopListening(_ call: CAPPluginCall) {
        if isListening {
            pedometer.stopUpdates()
            isListening = false
        }
        call.resolve(["success": true])
    }
    
    @objc func isSupported(_ call: CAPPluginCall) {
        let supported = CMPedometer.isStepCountingAvailable()
        call.resolve(["supported": supported])
    }
    
    @objc func requestPermissions(_ call: CAPPluginCall) {
        if HKHealthStore.isHealthDataAvailable() {
            let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
            healthStore.requestAuthorization(toShare: [], read: [stepType]) { success, error in
                DispatchQueue.main.async {
                    call.resolve(["granted": success])
                }
            }
        } else {
            call.resolve(["granted": true])
        }
    }
    
    deinit {
        if isListening {
            pedometer.stopUpdates()
        }
    }
}