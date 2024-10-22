const apiConfig = {
  clientId: 'yourRingCentralClientId',
  server: 'https://platform.ringcentral.com',
  redirectUri: 'https://ringcentral.github.io/ringcentral-embeddable/redirect.html',
};

let openOffscreenWindowPromise = null;

// const redirectUri = chrome.identity.getRedirectURL('redirect.html'); //  set this when oauth with chrome.identity.launchWebAuthFlow
const redirectUri = apiConfig.redirectUri;
const embeddableUriSearch = `multipleTabsSupport=1&disableLoginPopup=1&appServer=${apiConfig.server}&redirectUri=${redirectUri}`
async function openOffscreenWindow() {
  const offscreenUrl = chrome.runtime.getURL(`offscreen.html?${embeddableUriSearch}&mainTab=true`);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  if (existingContexts.length > 0) {
    return;
  }
  if (openOffscreenWindowPromise) {
    await openOffscreenWindowPromise;
    return;
  }
  openOffscreenWindowPromise = chrome.offscreen.createDocument({
    url: offscreenUrl,
    reasons: [
      'AUDIO_PLAYBACK',
      'USER_MEDIA',
      'WEB_RTC',
      'LOCAL_STORAGE',
      'BLOBS',
      'DOM_PARSER',
      'DOM_SCRAPING',
    ],
    justification: 'reason for needing the document',
  });
  await openOffscreenWindowPromise;
  openOffscreenWindowPromise = null;
}

openOffscreenWindow();

async function openPopupWindow() {
  console.log('check offscreen window');
  await openOffscreenWindow();
  console.log('open popup');
  const { popupWindowId } = await chrome.storage.local.get('popupWindowId');
  if (popupWindowId) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch (e) {
      // ignore
    }
  }
  let popupUri = `popup.html?${embeddableUriSearch}&mainTab=false`;
  if (apiConfig.clientId.length > 0) {
    popupUri = `${popupUri}&clientId=${apiConfig.clientId}`;
  }
  const popup = await chrome.windows.create({
    url: popupUri,
    type: 'popup',
    width: 300,
    height: 566,
  });
  await chrome.storage.local.set({
    popupWindowId: popup.id,
  });
}

chrome.action.onClicked.addListener(function (tab) {
  if (tab.url.indexOf('contacts.google.com') > -1) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'openAppWindow',
      }
    );
    return;
  }
  openPopupWindow();
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  const { popupWindowId } = await chrome.storage.local.get('popupWindowId');
  if (popupWindowId === windowId) {
    console.log('close popup');
    await chrome.storage.local.remove('popupWindowId');
  }
});

chrome.alarms.onAlarm.addListener(async () => {
  const { loginWindowId } = await chrome.storage.local.get('loginWindowId');
  if (!loginWindowId) {
    return;
  }
  const tabs = await chrome.tabs.query({ windowId: loginWindowId });
  if (tabs.length === 0) {
    return;
  }
  const loginWindowUrl = tabs[0].url
  console.log('loginWindowUrl', loginWindowUrl);
  if (loginWindowUrl.indexOf(apiConfig.redirectUri) !== 0) {
    chrome.alarms.create('oauthCheck',  { when: Date.now() + 3000 });
    return;
  }
  console.log('login success', loginWindowUrl);
  const { loginTabId } = await chrome.storage.local.get('loginTabId');
  chrome.tabs.sendMessage(
    loginTabId,
    {
      type: 'oauthCallBack',
      callbackUri: loginWindowUrl,
    },
  );
  await chrome.windows.remove(loginWindowId);
  await chrome.storage.local.remove('loginWindowId');
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log(sender.tab ?
              "from a content script:" + sender.tab.url :
              "from the extension");
  if (request.type === "openPopupWindow") {
    openPopupWindow();
    sendResponse({ result: 'ok' });
    return;
  }
  if (request.type === 'openOAuthWindow') {
    const loginWindow = await chrome.windows.create({
      url: request.oAuthUri,
      type: 'popup',
      width: 600,
      height: 600,
    });
    await chrome.storage.local.set({
      loginWindowId: loginWindow.id,
      loginTabId: sender.tab.id,
    });
    chrome.alarms.create('oauthCheck',  { when: Date.now() + 3000 });
    sendResponse({ result: 'ok' });
    return;
  }
  if (request.type === 'c2d' || request.type === 'c2sms') {
    openPopupWindow();
  }
  if (request.type === 'getEmbeddableUri') {
    sendResponse({ result: chrome.runtime.getURL(`offscreen.html?${embeddableUriSearch}&mainTab=false`) });
    return;
  }
});
