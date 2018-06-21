console.log('from standalong.js');

function buildO365CalendarUrl(params={}) {
  var encoded = [];
  if ('subject' in params) {
    encoded.push('subject=' + encodeURIComponent(params['subject']));
  }
  if ('body' in params) {
    encoded.push('body=' + encodeURIComponent(params['body']));
  }
  encoded.push('path=/calendar/action/compose')
  return 'https://outlook.office.com/owa/#' + encoded.join('&');
}

function responseMessage(request, response) {
  document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
    type: 'rc-post-message-response',
    responseId: request.requestId,
    response,
  }, '*');
}

function inviteConference(request) {
  const calendarUrl = buildO365CalendarUrl({
    'subject':'New Conference',
    'body': request.body.conference.inviteText});
  window.open(calendarUrl);
  responseMessage(request, { data: 'ok' });
}

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
      case 'rc-post-message-request':
        if (data.path === '/conference/invite') {
          inviteConference(data);
        }
      default:
        break;
    }
  }
});

function registerService() {
  document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
    type: 'rc-adapter-register-third-party-service',
    service: {
      name: 'TestService',
      conferenceInvitePath: '/conference/invite',
      conferenceInviteTitle: 'Invite with Office 365 Calendar'
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