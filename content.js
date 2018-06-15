console.log('import RingCentral Embeddable Voice');

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
