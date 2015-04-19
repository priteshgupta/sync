(function($, tabsList, mostVisited, search) {
  var buttons = document.getElementsByTagName('button'),
      h1 = document.getElementsByTagName('h1'),
      topSites = [],
      tabsObj = {};

  var loadTopSites = function(allMostVisited, search) {
    var html = '',
        sites;

    if (!allMostVisited && topSites.length > 5) {
       sites = topSites.slice(0, 6);
    }
    else {
      sites = topSites;
    }

    for (var i = 0, len = sites.length; i < sites.length; i++) {
      if (search && sites[i].title.toLowerCase().indexOf(search.toLowerCase()) === -1
                 && sites[i].url.toLowerCase().indexOf(search.toLowerCase()) === -1) {
        continue;
      }

      html += '<li><a href="' + sites[i].url + '">' + sites[i].title + ' - <span>' + sites[i].url + '</span></a>';
    }

    h1[1].innerHTML = 'Most Visted';
    mostVisited.innerHTML = html;
    buttons[1].style.display = 'inline';
  };

  var loadTabs = function(tabs, search) {
    var html = '';

    if (!tabs) {
      h1[0].innerHTML = 'No Tabs Opened :(';
      buttons[0].style.display = 'none';
      return;
    }
    else {
      h1[0].innerHTML = 'Tabs';
      buttons[0].style.display = 'inline';
      tabsObj = tabs;
    }

    Object.keys(tabs).forEach(function(tab) {
      if (search && tabs[tab].title.toLowerCase().indexOf(search.toLowerCase()) === -1
                 && tabs[tab].url.toLowerCase().indexOf(search.toLowerCase()) === -1) {
        return;
      }

      html += '<li><a href="' + tabs[tab].url + '">' + tabs[tab].title + ' - <span>' + tabs[tab].url + '</span></a>';
    });

    tabsList.innerHTML = html;
  };

  buttons[0].onclick = function(e) {
    var tabs = Object.keys(tabsObj),
        active;

    if (!tabs.length) return;

    tabs.forEach(function(tab) {
      if (tabsObj[tab].active) active = tab;

      window.buttons(tabsObj[tab].url);
    });

    chrome.tabs.update(parseInt(active, 10), { selected: true });
    window.close();
  };

  buttons[1].onclick = function(e) {
    search.value = '';
    loadTopSites(e.target.style.visibility = 'hidden');
  };

  search.onkeyup = function(e) {
    if (e.target.value === '') {
      Object.keys(tabsObj).length && (loadTabs(tabsObj));
      loadTopSites(true);
      return;
    }

    Object.keys(tabsObj).length && (loadTabs(tabsObj, e.target.value));
    loadTopSites(true, e.target.value);
  };

  chrome.storage.sync.get('user', function(items) {
    if (!items || !items.user || !items.user._id) return;

    $.ajax({
      url: 'http://104.236.76.220:3000/tabs/' + items.user._id,
      dataType: 'json',
      success: function(data) {
        if (data) {
          loadTabs(data[0].tabs);
        }
      }
    });
  });

  chrome.topSites.get(function(data) {
    topSites = data;
    loadTopSites();
  });
})(window.jQuery, window.tabs, window.mostVisited, window.search);