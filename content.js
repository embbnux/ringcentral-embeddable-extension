console.log('import RingCentral Embeddable Voice to web page');

(function() {
  var rcs = document.createElement("script");
  rcs.src = "https://ringcentral.github.io/ringcentral-embeddable-voice/adapter.js";
  var rcs0 = document.getElementsByTagName("script")[0];
  rcs0.parentNode.insertBefore(rcs, rcs0);
})();

// Interact with RingCentral Embeddable Voice:
window.addEventListener('message', (e) => {
  const data = e.data;
  if (data) {
    switch (data.type) {
      case 'rc-call-ring-notify':
        // get call on ring event
        console.log('RingCentral Embeddable Voice Extension:', data.call);
        break;
      case 'rc-call-end-notify':
        // get call on call end event
        console.log('RingCentral Embeddable Voice Extension:', data.call);
        break;
      case 'rc-call-start-notify':
        // get call on start a outbound call event
        console.log('RingCentral Embeddable Voice Extension:', data.call);
        break;
      default:
        break;
    }
  }
});

// Listen message from background.js to open app window when user click icon.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.action === 'openAppWindow') {
      console.log('opening window');
      // set app window minimized to false
      window.postMessage({
        type: 'rc-adapter-syncMinimized',
        minimized: false,
      }, '*');
      //sync to widget
      document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
        type: 'rc-adapter-syncMinimized',
        minimized: false,
      }, '*');
    }
    sendResponse('ok');
  }
);
