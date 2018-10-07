'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = parseRepositoryUrl;

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var repoRegExp = new RegExp('^/(.+?)/([^/.]+)');

function parseRepositoryUrl(url) {
  var parsed = (0, _url.parse)(url);
  var match = repoRegExp.exec(parsed.path || '');
  if (!match) throw new Error('unsupported source repository url: ' + url);

  var _match$slice = match.slice(1),
      _match$slice2 = (0, _slicedToArray3.default)(_match$slice, 2),
      organization = _match$slice2[0],
      repo = _match$slice2[1];

  return (0, _assign2.default)(parsed, { organization: organization, repo: repo });
}