package com.stepCounter;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.Calendar;

@CapacitorPlugin(
    name = "StepCounter",
    permissions = {
        @Permission(strings = { Manifest.permission.ACTIVITY_RECOGNITION }, alias = "activity")
    }
)
public class StepCounterPlugin extends Plugin implements SensorEventListener {
    
    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private int initialStepCount = -1;
    private int todaySteps = 0;
    private boolean isListening = false;
    private long lastStepTime = 0;

    @Override
    public void load() {
        super.load();
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        JSObject result = new JSObject();
        
        if (stepCounterSensor == null && stepDetectorSensor == null) {
            result.put("success", false);
            call.resolve(result);
            return;
        }

        // Request permissions if needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACTIVITY_RECOGNITION) 
                != PackageManager.PERMISSION_GRANTED) {
                requestPermissionForAlias("activity", call, "permissionCallback");
                return;
            }
        }

        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void getTodaySteps(PluginCall call) {
        JSObject result = new JSObject();
        result.put("steps", todaySteps);
        call.resolve(result);
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        JSObject result = new JSObject();
        
        if (stepCounterSensor == null && stepDetectorSensor == null) {
            result.put("success", false);
            call.resolve(result);
            return;
        }

        if (!isListening) {
            // Prefer step counter for accuracy, fallback to step detector
            if (stepCounterSensor != null) {
                sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
            } else if (stepDetectorSensor != null) {
                sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI);
            }
            isListening = true;
        }

        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        if (isListening) {
            sensorManager.unregisterListener(this);
            isListening = false;
        }

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", stepCounterSensor != null || stepDetectorSensor != null);
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            requestPermissionForAlias("activity", call, "permissionCallback");
        } else {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        }
    }

    private void permissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACTIVITY_RECOGNITION) 
                         == PackageManager.PERMISSION_GRANTED;
        result.put("granted", granted);
        if (call != null) {
            call.resolve(result);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        long currentTime = System.currentTimeMillis();
        
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            // Hardware step counter - more accurate
            int currentStepCount = (int) event.values[0];
            
            if (initialStepCount == -1) {
                initialStepCount = currentStepCount;
                todaySteps = 0;
            } else {
                todaySteps = currentStepCount - initialStepCount;
            }
            
            // Notify listeners
            JSObject data = new JSObject();
            data.put("steps", todaySteps);
            data.put("timestamp", currentTime);
            notifyListeners("stepUpdate", data);
            
        } else if (event.sensor.getType() == Sensor.TYPE_STEP_DETECTOR) {
            // Step detector - increment counter
            if (currentTime - lastStepTime > 150) { // Reduced debounce for higher sensitivity
                todaySteps++;
                lastStepTime = currentTime;
                
                // Notify listeners
                JSObject data = new JSObject();
                data.put("steps", todaySteps);
                data.put("timestamp", currentTime);
                notifyListeners("stepUpdate", data);
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Handle accuracy changes if needed
    }

    @Override
    protected void handleOnDestroy() {
        if (isListening) {
            sensorManager.unregisterListener(this);
            isListening = false;
        }
        super.handleOnDestroy();
    }
}