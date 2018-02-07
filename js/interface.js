var data = Fliplet.Widget.getData() || {};

if (!data.files) {
  data.files = [];
}

var filesString = data.files.map(function (file) {
  return file.url;
}).join('\r\n');

$('textarea').val(filesString);

Fliplet().then(function () {
  $(window).on('resize', Fliplet.Widget.autosize);

  $('form').submit(function (event) {
    event.preventDefault();

    var txt = $('textarea').val();
    data.files = txt.split('\n').map(function (url, idx) {
      url = url.trim();
      var pieces = url.split('.');

      return {
        url: url,
        path: 'bundle/' + idx + '.' + pieces[pieces.length-1],
        updatedAt: Math.round(Date.now()/1000)
      };
    });

    Fliplet.Widget.save(data).then(function () {
      Fliplet.Widget.complete();
      alert('Done!');
    });
  });

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    $('form').submit();
  });
});
