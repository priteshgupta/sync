(function($, tabsList, mostVisited) {
  var open = document.getElementsByTagName('button'),
      h1 = document.getElementsByTagName('h1'),
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
            h1[0].innerHTML = 'No Tabs Opened :(';
            open[0].style.display = 'none';
            return;
          }
          else {
            h1[0].innerHTML = 'Tabs';
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

  var loadTopSites = function(allMostVisited) {
    chrome.topSites.get(function(data) {
      var html = '';

      if (!allMostVisited) {
        data.length > 5 && (data.splice(6));
      }

      for (var i = 0, len = data.length; i < data.length; i++) {

        html += '<li><a href="' + data[i].url + '">' + data[i].title + ' - <span>' + data[i].url + '</span></a>';
      }

      h1[1].innerHTML = 'Most Visted';
      mostVisited.innerHTML = html;
      open[1].style.display = 'inline';
    });
  };

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

  open[1].onclick = function(e) {
    loadTopSites(e.target.style.display = 'none');
  };

  loadTopSites();
})(window.jQuery, window.tabs, window.mostVisited);