package com.example.vue3app;

import android.content.Context;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import com.tl.uic.Tealeaf;
import com.tl.uic.javascript.JavaScriptInterface;

public class MainActivity extends BridgeActivity {
  private WebView webView;
  private Context context;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initialize Tealeaf SDK
    new Tealeaf(getApplication());
    Tealeaf.enable();

    // Get Webview via Capacitor bridge
    context = bridge.getContext();
    webView = bridge.getWebView();

    webView.clearCache(true);
    WebSettings webSettings = webView.getSettings();
    webSettings.setJavaScriptEnabled(true);

    // Add Tealeaf JavaScriptInterface
    webView.addJavascriptInterface(new JavaScriptInterface(getApplication(), webView, Tealeaf.getPropertyName((View)webView).getId()), "tlBridge");

    // Webview client pageloaded callback
    bridge.addWebViewListener(new WebViewListener() {
      @Override
      public void onPageLoaded(WebView webView) {
        super.onPageLoaded(webView);

        webView.loadUrl("javascript:TLT.registerBridgeCallbacks([ "
          + "{enabled: true, cbType: 'screenCapture', cbFunction: function (){tlBridge.screenCapture();}},"
          + "{enabled: true, cbType: 'messageRedirect', cbFunction: function (data){tlBridge.addMessage(data);}}]);");
      }
    });
  }
}
