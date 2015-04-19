(function($, search) {
  'use strict';

  var h1 = document.getElementsByTagName('h1'),
      list = document.getElementsByTagName('ul'),
      button = document.getElementsByTagName('button'),
      topSites = [],
      tabsObj = {},
      lastVisitTime,
      userId;

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

  var loadHistory = function(options, search) {
    var html = '';

    options || (options = {
      limit: 6
    });

    $.ajax({
      url: 'http://104.236.76.220:3000/history/' + userId,
      dataType: 'json',
      success: function(data) {
        if (data) {
          var keys = Object.keys(data).sort().reverse(),
              ct = 0;

          if (options.start) {
            keys = keys.slice(keys.indexOf(options.start) + 1);
          }

          if (keys.length < options.limit) {
            button[2].style.display = 'none';
          }

          keys.every(function(key) {

            chrome.history.search({
              text: data[key].url,
              maxResults: 1
            }, function(result) {
              if (!result.length) {
                chrome.history.addUrl({
                  url: data[key].url
                });
              }
            });

            html += '<li><a href="' + data[key].url + '">' + data[key].title + ' - <span>' + data[key].url + '</span> <i> -' + moment(parseInt(key, 10)).format('h:mm A - MMMM Do') + '</i></a>';
            return ++ct < options.limit;
          });

          lastVisitTime = keys[--ct];
          h1[2].innerHTML = 'Recent History';
          list[2].innerHTML += html;
        }
      }
    });

    // chrome.history.search(options, function(data) {
    //   var len = len < 6 ? len : 6;

    //   for (var i = 0; i < len; i++) {
    //     html += '<li><a href="' + data[i].url + '">' + data[i].title + ' - <span>' + data[i].url + '</span></a>';
    //   }

    //   lastVisitTime = data[len].lastVisitTime;
    //   h1[2].innerHTML = 'Recent History';
    //   list[2].innerHTML = html;
    // });
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

  button[2].onclick = function(e) {
    loadHistory({
      start: lastVisitTime,
      limit: 6
    });
  };

  search.onkeyup = function(e) {
    if (e.target.value === '') {
      Object.keys(tabsObj).length && (loadTabs(tabsObj));
      loadTopSites(true);
      // loadHistory();
      return;
    }

    Object.keys(tabsObj).length && (loadTabs(tabsObj, e.target.value));
    // loadHistory(null, e.target.value);
    loadTopSites(true, e.target.value);
  };

  chrome.storage.sync.get('user', function(items) {
    if (!items || !items.user || !items.user._id) return;
    userId = items.user._id;

    $.ajax({
      url: 'http://104.236.76.220:3000/tabs/' + items.user._id,
      dataType: 'json',
      success: function(data) {
        if (data) loadTabs(data[0].tabs);
      }
    });

    loadHistory();
  });

  chrome.topSites.get(function(data) {
    topSites = data;
    loadTopSites();
  });
})(window.jQuery, window.search);