console.log('from standalong.js');
window.__ON_RC_POPUP_WINDOW = 1;

function responseMessage(request, response) {
  document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
    type: 'rc-post-message-response',
    responseId: request.requestId,
    response,
  }, '*');
}

// Interact with RingCentral Embeddable Voice:
window.addEventListener('message', (e) => {
  const data = e.data;
  if (data) {
    switch (data.type) {
      case 'rc-login-popup-notify':
        handleOAuthWindow(data.oAuthUri);
        break;
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'oauthCallBack') {
    document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
      type: 'rc-adapter-authorization-code',
      callbackUri: request.callbackUri,
    }, '*');
    sendResponse({ result: 'ok' });
  } else if (request.type === 'c2sms') {
    document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
      type: 'rc-adapter-new-sms',
      phoneNumber: request.phoneNumber,
    }, '*');
    sendResponse({ result: 'ok' });
  } else if (request.type === 'c2d') {
    document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
      type: 'rc-adapter-new-call',
      phoneNumber: request.phoneNumber,
      toCall: true,
    }, '*');
    sendResponse({ result: 'ok' });
  }
});

async function handleOAuthWindow(oAuthUri) {
  chrome.runtime.sendMessage({
    type: 'openOAuthWindow',
    oAuthUri,
  });
  // chrome.identity.launchWebAuthFlow(
  //   {
  //     url: oAuthUri,
  //     interactive: true,
  //   },
  //   (responseUrl) => {
  //     if (responseUrl) {
  //       document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
  //         type: 'rc-adapter-authorization-code',
  //         callbackUri: responseUrl,
  //       }, '*');
  //     }
  //   },
  // );
}

function registerService() {
  document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
    type: 'rc-adapter-register-third-party-service',
    service: {
      name: 'TestService',
    }
  }, '*');
}

var registered = false;
window.addEventListener('message', function (e) {
  const data = e.data;
  if (data && data.type === 'rc-adapter-pushAdapterState' && registered === false) {
    registered = true;
    registerService();
  }
});