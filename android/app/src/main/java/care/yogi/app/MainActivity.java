package care.yogi.app;

import android.os.Bundle;

import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the plugin on initialization
        registerPlugin(FirebaseAuthenticationPlugin.class);
        super.onCreate(savedInstanceState);
    }
}