/* eslint-disable */
var data = Fliplet.Widget.getData() || {};

if (!data.files) {
  data.files = [];
}

var filesString = data.files.map(function (file) {
  return file.url;
}).join('\r\n');

$('textarea').val(filesString);
$('textarea').change(function () {
  $('.result').val('');
})

Fliplet().then(function () {
  $(window).on('resize', Fliplet.Widget.autosize);

  $('form').submit(function (event) {
    event.preventDefault();

    var txt = $('textarea').val();

    $('.result').html('<div class="alert alert-info">Validating files...</div>');
    Fliplet.Widget.autosize();

    Promise.all(_.compact(txt.split('\n')).map(function (url, idx) {
      url = url.trim();

      if (!url.match(/^https?:\/\/.+/)) {
        url = 'http://' + url;
      }

      return Fliplet.API.request({
        url: 'v1/widgets/fetch-content-type',
        method: 'POST',
        data: {
          url: url
        }
      }).then(function (response) {
        var contentType = response.contentType;
        var extension;

        if (contentType.indexOf('css') !== -1) {
          extension = 'css';
        } else if (contentType.indexOf('javascript') !== -1) {
          extension = 'js';
        } else {
          return Promise.reject('<strong>Error</strong>: The content type for URL <strong>' + url + '</strong> is <code>' + contentType + '</code><br><br>Only CSS/JavaScript files are accepted.');
        }

        return {
          url: url,
          path: 'bundle/file-' + idx + '.' + extension,
          context: 'page',
          updatedAt: Math.round(Date.now()/1000)
        };
      }, function (err) {
        console.error(err);
        return Promise.reject('<strong>Error</strong>: There was en error fetching the URL <strong>' + url + '</strong> <code>' + err.status + ' - ' + err.statusText + '</code><br><brSee console for more information.');
      });
    })).then(function (files) {
      Fliplet.Widget.save({
        files: files
      }).then(function () {
        $('.result').html('<div class="alert alert-success">Saved! The files are now available in your app.</div>');
        Fliplet.Widget.autosize();
      });
    }).catch(function (error) {
      $('.result').html('<div class="alert alert-danger">' + error + '</div>');
      Fliplet.Widget.autosize();
    });
  });

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    $('form').submit();
  });

  Fliplet.Widget.autosize();
});
