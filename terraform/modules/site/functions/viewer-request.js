// CloudFront Function (viewer request) for the site's default behavior.
// Terraform renders this file per environment with templatefile(), replacing
// the noindex placeholder with true or false. Tests: functions.test.mjs.
var NOINDEX = ${noindex};

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  // www.<domain> redirects to <domain>, keeping the path and query string.
  if (host.indexOf('www.') === 0) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + host.slice(4) + request.uri + queryString(request.querystring) },
      },
    };
  }

  // QA tells crawlers to stay out, whatever the deployed build contains.
  if (NOINDEX && request.uri === '/robots.txt') {
    return {
      statusCode: 200,
      statusDescription: 'OK',
      headers: {
        'content-type': { value: 'text/plain; charset=utf-8' },
        'x-robots-tag': { value: 'noindex, nofollow' },
      },
      body: { encoding: 'text', data: 'User-agent: *\nDisallow: /\n' },
    };
  }

  // Client-side routes (/, /experience/1) have no file extension: serve the
  // React app's index.html and let React Router render the page. Files keep
  // their own path. (A distribution-wide error page could do this too, but it
  // would also turn API 404s into HTML.)
  var lastSegment = request.uri.slice(request.uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = '/index.html';
  }
  return request;
}

// Rebuilds the query string from the event's querystring object, keeping
// repeated keys and keys with no value.
function queryString(params) {
  var parts = [];
  for (var key in params) {
    var values = params[key].multiValue || [params[key]];
    for (var i = 0; i < values.length; i++) {
      parts.push(values[i].value === '' ? key : key + '=' + values[i].value);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}
