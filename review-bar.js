// review-bar.js — visual review bar only (no schema injection)
document.addEventListener('DOMContentLoaded', function () {
  var anchorEl =
    document.querySelector('.site-header') ||
    document.querySelector('header') ||
    document.querySelector('nav');

  if (anchorEl && !document.querySelector('.top-review-bar')) {
    var bar = document.createElement('div');
    bar.className = 'top-review-bar';

    bar.innerHTML =
      '<span class="star-icons" aria-hidden="true">★★★★★</span>' +
      '<span class="review-text">4.9 rating · ' +
        '<a href="/reviews.html" class="review-link" aria-label="Read 126 homeowner reviews">' +
          '126 homeowner reviews' +
        '</a>' +
      '</span>';

    if (anchorEl.parentNode) {
      anchorEl.parentNode.insertBefore(bar, anchorEl.nextSibling);
    }
  }
});
