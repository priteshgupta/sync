(function($, search) {
  'use strict';

  var h1 = document.getElementsByTagName('h1'),
      list = document.getElementsByTagName('ul'),
      button = document.getElementsByTagName('button'),
      topSites = [],
      tabsObj = {},
      lastVisitTime;

  var loadTabs = function(tabs, search) {
    var html = '';

    if (!tabs) {
      h1[0].innerHTML = 'No Tabs Opened :(';
      button[0].style.display = 'none';
      return;
    }
    else {
      h1[0].innerHTML = 'Current Tabs';
      button[0].style.display = 'inline';
      tabsObj = tabs;
    }

    Object.keys(tabs).forEach(function(tab) {
      if (search && tabs[tab].title.toLowerCase().indexOf(search.toLowerCase()) === -1
                 && tabs[tab].url.toLowerCase().indexOf(search.toLowerCase()) === -1) {
        return;
      }

      html += '<li><a href="' + tabs[tab].url + '">' + tabs[tab].title + ' - <span>' + tabs[tab].url + '</span></a>';
    });

    list[0].innerHTML = html;
  };

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
    list[1].innerHTML = html;
    // button[1].style.display = 'inline';
  };

  var loadHistory = function(options) {
    var html = '';

    options || (options = {
      text: ''
    });

    chrome.history.search(options, function(data) {
      var len = len < 6 ? len : 6;

      for (var i = 0; i < len; i++) {
        html += '<li><a href="' + data[i].url + '">' + data[i].title + ' - <span>' + data[i].url + '</span></a>';
      }

      lastVisitTime = data[len].lastVisitTime;
      h1[2].innerHTML = 'Recent History';
      list[2].innerHTML = html;
    });
  };

  button[0].onclick = function(e) {
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

  button[1].onclick = function(e) {
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
    if (!items || !items.user || !items.user._id) {
      h1[0].innerHTML = "Couldn't open account";
      let html = "<a href=chrome-extension://jmilcjgehddfpbaibppeocngcnagjgdi/src/options/index.html>Please sign in</a>";
      $("ul:first").after(html);
      $("#history").css("display", "none");
      $("button:first").css("display", "none");
      return;
    } else {
      $("#history").display = 'block';
      $.ajax({
        url: 'http://104.236.76.220:3000/tabs/' + items.user._id,
        dataType: 'json',
        success: function(data) {
          if (data) loadTabs(data[0].tabs);
        }
      });
    }
  });

  chrome.topSites.get(function(data) {
    topSites = data;
    loadTopSites();
    loadHistory();
  });
})(window.jQuery, window.search);