// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });

var currentTabs = {},
    url = 'http://104.236.76.220:3000/tabs/',
    userId;

chrome.storage.sync.get('user', function(items) {
  if (items && items.user && items.user._id) {
    userId = items.user._id;
  }
});

var uploadTabs = function(tabs) {
  if (!userId) return;

  $.ajax({
    method: "POST",
    url: url + userId,
    dataType: 'JSON',
    data: {tabs: tabs},
    success: function(data) {
    }
  });
};

var updateTabs = function(tabId, changeInfo, tab) {
  if (!tab || !userId || tab.status !== 'complete') return;
  // if (currentTabs[tabId] && currentTabs[tabId].url === tab.url && tab.status !== 'complete') return;

  if (tab.url.indexOf('chrome://') > -1) return;
  if (tab.url.indexOf('chrome-extension://') > -1) return;
  if (tab.url.indexOf('104.236.76.220:3000') > -1) return;

  $.ajax({
    method: 'POST',
    url: 'http://104.236.76.220:3000/history/' + userId + '/chrome',
    data: {
      time: new Date().getTime(),
      url: tab.url,
      title: tab.title
    },
    dataType: 'text',
    success: function(data) {
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(textStatus + ' ' + errorThrown);
    }
  });

  currentTabs[tabId] = {
    active: tab.active,
    url: tab.url,
    title: tab.title
  };

  uploadTabs(currentTabs);
};

var queryTabs = function() {
  chrome.tabs.query({}, function(tabs) {

    tabs.forEach(function(tab) {
      if (tab.url.indexOf('chrome://') > -1) return;
      if (tab.url.indexOf('chrome-extension://') > -1) return;
      if (tab.url.indexOf('104.236.76.220:3000') > -1) return;

      currentTabs[tab.id] = {
        active: tab.active,
        url: tab.url,
        title: tab.title
      };
    });

    uploadTabs(currentTabs);
  });
};

chrome.tabs.onUpdated.addListener(updateTabs);

chrome.tabs.onCreated.addListener(updateTabs);

chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
  queryTabs();
});

queryTabs();
