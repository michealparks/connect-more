// Silly Microsoft Stuff.
function initWindows() {
  "use strict";

  WinJS.Binding.optimizeBindingReferences = true;

  var app = WinJS.Application;
  var activation = Windows.ApplicationModel.Activation;

  app.onactivated = function (args) {
    if (args.detail.kind === activation.ActivationKind.launch) {
      if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
        require('app');
      } else {
        // TODO: This application has been reactivated from suspension.
        // Restore application state here.
      }
      args.setPromise(WinJS.UI.processAll());
    }
  };

  app.oncheckpoint = function (args) {
    // TODO: This application is about to be suspended. Save any state
    // that needs to persist across suspensions here. You might use the
    // WinJS.Application.sessionState object, which is automatically
    // saved and restored across suspension. If you need to complete an
    // asynchronous operation before your application is suspended, call
    // args.setPromise().
  };

  app.onsettings = function (args) {
    args.detail.applicationcommands = {
      "priv": {
        title: "Privacy Policy", 
        href: "/privacy.html"
      }
    };
    WinJS.UI.SettingsFlyout.populateSettings(args);
  };

  app.start();
}

if (WinJS in window && Windows in window) {
  initWindows();
} else {
  require('app');
}
