
let newWindow;
chrome.browserAction.onClicked.addListener(function (tab) {
  // open float app window when click icon in office page
  if (tab && tab.url && tab.url.indexOf('office.com') > -1) {
    // send message to content.js to to open app window.
    chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function(response) {
      console.log(response);
    });
    return;
  }
  // open standalong app window when click icon
  if (!newWindow) {
    chrome.windows.create({
      url: './standalong.html',
      type: 'popup',
      focused: true,
      width: 300,
      height: 536
    }, function (wind) {
      newWindow = wind;
    });
  } else {
    chrome.windows.update(newWindow.id, {
      focused: true,
    });
  }
});
chrome.windows.onRemoved.addListener(function (id) {
  console.log(id);
  if (newWindow && newWindow.id === id) {
    newWindow = null;
  }
});
