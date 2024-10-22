console.log('import content js to web page');

function sendMessageToWidget(message) {
  document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage(message, '*');
}

window.clickToDialInject = new window.RingCentralC2D();
window.clickToDialInject.on(
  window.RingCentralC2D.events.call,
  function(phoneNumber) {
    console.log('Click To Dial:', phoneNumber);
    // alert('Click To Dial:' + phoneNumber);
    if (window.RCAdapter) {
      sendMessageToWidget({
        type: 'rc-adapter-new-call',
        phoneNumber,
        toCall: true,
      });
      return;
    }
    chrome.runtime.sendMessage({
      type: 'c2d',
      phoneNumber,
    });
  },
);
window.clickToDialInject.on(
  window.RingCentralC2D.events.text,
  function(phoneNumber) {
    console.log('Click To SMS:', phoneNumber);
    // alert('Click To SMS:' + phoneNumber);
    if (window.RCAdapter) {
      sendMessageToWidget({
        type: 'rc-adapter-new-sms',
        phoneNumber,
      });
      return;
    }
    chrome.runtime.sendMessage({
      type: 'c2sms',
      phoneNumber,
    });
  },
);

function responseMessage(request, response) {
  sendMessageToWidget({
    type: 'rc-post-message-response',
    responseId: request.requestId,
    response,
  });
}

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

// Listen message from background.js to open app window when user click icon.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.type === 'openAppWindow') {
      console.log('opening window');
      // set app window minimized to false
      window.postMessage({
        type: 'rc-adapter-syncMinimized',
        minimized: false,
      }, '*');
      //sync to widget
      sendMessageToWidget({
        type: 'rc-adapter-syncMinimized',
        minimized: false,
      });
      sendResponse('ok');
      return;
    }
    if (request.type === 'oauthCallBack') {
      document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
        type: 'rc-adapter-authorization-code',
        callbackUri: request.callbackUri,
      }, '*');
      sendResponse({ result: 'ok' });
    }
  }
);

chrome.runtime.sendMessage(
  {
    type: 'getEmbeddableUri',
  },
  function(response) {
    // parse uri into options
    const options = response.result.split('?')[1].split('&').reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[key] = value;
      return acc;
    }, {});
    window.RCAdapterInit({
      appUrl: chrome.runtime.getURL('embeddable/app.html'),
      options: options,
    });
});
