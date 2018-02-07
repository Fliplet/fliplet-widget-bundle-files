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
    data.files = txt.split('\n').map(function (url, idx) {
      url = url.trim();
      var pieces = url.split('.');

      return {
        url: url,
        path: 'bundle/' + idx + '.' + pieces[pieces.length-1],
        updatedAt: Math.round(Date.now()/1000)
      };
    });

    $('.result').html('');

    Fliplet.Widget.save(data).then(function () {
      $('.result').html('<div class="alert alert-success" role="alert">Done! Your app bundle has been updated.</div>');
    });
  });

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    $('form').submit();
  });
});
