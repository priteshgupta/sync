(function($, tabsList, title, mostVisited) {
  var open = document.getElementsByTagName('a'),
      html = '',
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
            open[0].style.display = 'none';
            return;
          }
          else {
            title.innerHTML = 'Tabs';
            open[0].style.display = 'inline';
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

  chrome.topSites.get(function(data) {
    var html = '';

    data.length > 5 && (data.splice(6));

    for (var i = 0, len = data.length; i < data.length; i++) {

      html += '<li><a href="' + data[i].url + '">' + data[i].title + ' - <span>' + data[i].url + '</span></a>';
    }

    mostVisited.innerHTML = html;
  });


  open[0].onclick = function(e) {
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

  // openMVAll.onclick = function
})(window.jQuery, window.tabs, window.title, window.mostVisited);