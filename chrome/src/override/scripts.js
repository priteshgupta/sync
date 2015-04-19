(function($, tabsList, openAll, title) {
  var html = '',
      tabsObj = {};

  chrome.storage.sync.get('user', function(items) {
    if (!items || !items.user || !items.user._id) return;

    $.ajax({
      url: 'http://104.236.76.220:3000/tabs/' + items.user._id,
      dataType: 'json',
      success: function(data) {
        if (data) {
          var tabs = data[0].tabs;

          if (!tabs) {
            title.innerHTML = 'No Tabs Opened :(';
            window.openAll.style.display = 'none';
            return;
          }
          else {
            title.innerHTML = 'Tabs';
            window.openAll.style.display = 'inline';
            tabsObj = tabs;
          }

          Object.keys(tabs).forEach(function(tab) {
            html += '<li><a href="' + tabs[tab].url + '">' + tabs[tab].title + ' - <span>' + tabs[tab].url + '</span></a>';
          });

          tabsList.innerHTML = html;
        }
      }
    });
  });

  openAll.onclick = function(e) {
    var tabs = Object.keys(tabsObj),
        active;

    if (!tabs.length) return;

    tabs.forEach(function(tab) {
      if (tabsObj[tab].active) active = tab;

      window.open(tabsObj[tab].url);
    });

    chrome.tabs.update(parseInt(active, 10), { selected: true });
    window.close();
  };
})(window.jQuery, window.tabs, window.openAll, window.title);