// review-bar.js
document.addEventListener('DOMContentLoaded', function () {
  // === 1) VISUAL REVIEW BAR UNDER NAV/HEADER ===
  var anchorEl =
    document.querySelector('.site-header') ||
    document.querySelector('header') ||
    document.querySelector('nav');

  if (anchorEl && !document.querySelector('.top-review-bar')) {
    var bar = document.createElement('div');
    bar.className = 'top-review-bar';

    // NOTE: Update href if your reviews page is named differently
bar.innerHTML =
  '<span class="star-icons" aria-hidden="true">★★★★★</span>' +
  '<span class="review-text">5.0 rating · ' +
    '<a href="/reviews.html" class="review-link" aria-label="Read 126 homeowner reviews">' +
      '126 homeowner reviews' +
    '</a>' +
  '</span>';



    if (anchorEl.parentNode) {
      anchorEl.parentNode.insertBefore(bar, anchorEl.nextSibling);
    }
  }

  // === 2) JSON-LD STRUCTURED DATA FOR REVIEW SNIPPETS ===
  if (!document.querySelector('script[data-review-schema="pergola-builder"]')) {
    var schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://pergola-builder-new.vercel.app/#business",
      "name": "Pergola Builder Houston",
      "url": "https://pergola-builder-new.vercel.app/",
      "telephone": "+1-832-509-5457",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Houston",
        "addressRegion": "TX",
        "postalCode": "77007",
        "addressCountry": "US"
      },
      "areaServed": {
        "@type": "City",
        "name": "Houston"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": 126,
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.setAttribute('data-review-schema', 'pergola-builder');
    ld.text = JSON.stringify(schema);
    document.head.appendChild(ld);
  }
});
