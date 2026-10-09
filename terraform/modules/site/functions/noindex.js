// CloudFront Function (viewer response), attached only where noindex is on
// (QA): asks search engines not to index anything. It doesn't run on 4xx/5xx
// responses from the origin, which aren't indexed anyway.
// Tests: functions.test.mjs.
function handler(event) {
  var response = event.response;
  response.headers['x-robots-tag'] = { value: 'noindex, nofollow' };
  return response;
}
