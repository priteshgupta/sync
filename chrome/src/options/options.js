(function($, signin) {
  'use strict';

  chrome.storage.sync.get('user', function(items) {
    if (items && items.user && items.user._id) {
      signout.style.display = 'block';
      signin.style.display = 'none';
      signup.style.display = 'none';
    }
    else {
      signin.style.display = 'block';
      signup.style.display = 'block';
    }
  });

  var reload = function() {
    document.location.reload();
  };

  signin.onsubmit = function(e) {
    e.preventDefault();

    var inputs = e.target.getElementsByTagName('input');

    $.ajax({
      method: 'POST',
      url: 'http://104.236.76.220:3000/auth/signin',
      data: {
        username: inputs[0].value,
        password: inputs[1].value
      },
      dataType: 'JSON',
      success: function(data) {
        if (data) {
          chrome.storage.sync.set({'user': data}, reload);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        alert(textStatus + ' ' + errorThrown);
      }
    });
  };

  signup.onsubmit = function(e) {
    e.preventDefault();

    var inputs = e.target.getElementsByTagName('input');

    $.ajax({
      method: 'POST',
      url: 'http://104.236.76.220:3000/auth/signup',
      data: {
        username: inputs[0].value,
        password: inputs[1].value,
        firstName: inputs[2].value,
        lastName: inputs[3].value,
        email: inputs[4].value
      },
      dataType: 'JSON',
      success: function(data) {

        if (data) {
          $.ajax({
              url: 'http://104.236.76.220:3000/create-history/' + data.user._id,
              dataType: 'text',
              success: function(data) {
              },
              error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + ' ' + errorThrown);
              }
            });
          };

          chrome.storage.sync.set({'user': data}, reload);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus + ' ' + errorThrown);
      }
    });
  };

  signout.onclick = function(e) {
    e.preventDefault();

    $.ajax({
      url: 'http://104.236.76.220:3000/auth/signout',
      dataType: 'text',
      success: function(data) {
        if (data) {
          chrome.storage.sync.set({'user': null}, reload);
        }
      }
    });
  };

})(window.jQuery, window.signin);
