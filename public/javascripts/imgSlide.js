var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");

  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";

}
carousel();

function carousel() {
  var i;
  var x = document.getElementsByClassName("mySlides");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) { slideIndex = 1 }
  x[slideIndex - 1].style.display = "block";
  setTimeout(carousel, 8000); // Change image every 8 seconds
}

//next


$(document).ready(function () {
  $('#imgPrez').each(function () {
    var $el = $(this),
      staticSrc = $el.attr('src'),
      gifSrc = $el.data('gifSrc');
    $el.click(function () {

      $(this).attr("src", gifSrc);

      //  $(this).wait(800).attr("src", staticSrc);
      setTimeout(function () {
        $("#imgPrez").attr("src", "/images/wal3.jpg");
      }, 600);

    });
  });
});

if ($('#pupdated').is(":visible")) {
  $("#pupdated").fadeOut(5000);
}



$(document).ready(function () {
  $('#edit').click(function () {
    if ($(this).text() === "Players") {
      $(this).html("Guilds")
      gr();
    } else {
      $(this).html("Players")
      pr()
    }
    $(this).toggleClass("clicked");

  });
});

function pr() {
  var data = {};
  data.d = [{ name: 'Test1', lvl: '1' },
  { name: 'test2', lvl: '2' },
  { name: 'Test3', lvl: '3' }];
  $("#rank th:last-child").show();
  $('#rank tr').not(':first').remove();

  var html = '';
  for (var i = 1; i <= data.d.length; i++)

    html += "<tr><td id='no'>" + i + "</td><td>" + data.d[i - 1].name + "</td><td id='lvl'>" + data.d[i - 1].lvl + "</td> </tr>";
  $('#rank tr').first().after(html);

}

function gr() {
  var data = {};
  data.d = [{ name: 'Test1' },
  { name: 'test2' },
  { name: 'Test3' }];
  $("#rank th:last-child").hide();
  $('#rank tr').not(':first').remove();
  var html = '';
  for (var i = 1; i <= data.d.length; i++)

    html += "<tr><td id='no'>" + i + "</td><td>" + data.d[i - 1].name + "</td></tr>";
  $('#rank tr').first().after(html);


}