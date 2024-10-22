console.log('from offscreen.js');

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
        chrome.runtime.sendMessage({
          type: 'openPopupWindow',
        });
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

const iframeUrl = `./embeddable/app.html` + window.location.search;
const iframe = document.querySelector('iframe');
iframe.src = iframeUrl;
