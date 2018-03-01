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

    $('.result').html('<div class="alert alert-info" role="alert">Validating files...</div>');

    Promise.all(txt.split('\n').map(function (url, idx) {
      url = url.trim();

      if (!url.match(/^https?:\/\/.+/)) {
        return Promise.reject('The URL "' + url + '" needs to start with http:// or https://.');
      }

      var parts = url.split('?');
      url = parts[0];
      var pieces = url.split('.');
      var extension = (_.last(pieces) || '').toLowerCase();

      // TODO: Use API proxy to check whether links are valid and what's their content type

      if (['css', 'js'].indexOf(extension) === -1) {
        return Promise.reject('The URL "' + url + '" needs to reference a file ending with .css or .js extension.');
      }

      return {
        url: url,
        path: 'bundle/' + idx + '.' + extension,
        updatedAt: Math.round(Date.now()/1000)
      };
    })).then(function (files) {
      Fliplet.Widget.save({
        files: files
      }).then(function () {
        $('.result').html('<div class="alert alert-success" role="alert">Done! Your app bundle has been updated.</div>');
      });
    }).catch(function (error) {
      $('.result').html('<div class="alert alert-danger" role="alert">' + error + '</div>');
    });
  });

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    $('form').submit();
  });

  Fliplet.Widget.autosize();
});
