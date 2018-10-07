'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var readLines = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(file) {
    var data;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _fsExtra2.default.readFile(file, 'utf8');

          case 2:
            data = _context3.sent;
            return _context3.abrupt('return', data.split(/\r\n|\r|\n/mg));

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function readLines(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var replaceInFiles = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(directory, replacements) {
    var _this2 = this;

    var _ref5 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref5$ignore = _ref5.ignore,
        ignore = _ref5$ignore === undefined ? [] : _ref5$ignore;

    var files;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _es6Promisify.promisify)(_glob2.default)(_path2.default.resolve(directory, '**'), {
              dot: true,
              ignore: ignore.map(function (file) {
                return _path2.default.resolve(directory, file);
              })
            });

          case 2:
            files = _context5.sent;
            _context5.next = 5;
            return _promise2.default.all(files.map(function () {
              var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(file) {
                var oldText, newText, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref7, _ref8, find, replace;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        oldText = void 0;
                        _context4.prev = 1;
                        _context4.next = 4;
                        return _fsExtra2.default.readFile(file, 'utf8');

                      case 4:
                        oldText = _context4.sent;
                        _context4.next = 12;
                        break;

                      case 7:
                        _context4.prev = 7;
                        _context4.t0 = _context4['catch'](1);

                        if (!(_context4.t0.code === 'EISDIR')) {
                          _context4.next = 11;
                          break;
                        }

                        return _context4.abrupt('return');

                      case 11:
                        throw _context4.t0;

                      case 12:
                        newText = oldText;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context4.prev = 16;

                        for (_iterator = (0, _getIterator3.default)(replacements); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                          _ref7 = _step.value;
                          _ref8 = (0, _slicedToArray3.default)(_ref7, 2);
                          find = _ref8[0];
                          replace = _ref8[1];

                          newText = replaceAll(newText, find, replace);
                        }
                        _context4.next = 24;
                        break;

                      case 20:
                        _context4.prev = 20;
                        _context4.t1 = _context4['catch'](16);
                        _didIteratorError = true;
                        _iteratorError = _context4.t1;

                      case 24:
                        _context4.prev = 24;
                        _context4.prev = 25;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                          _iterator.return();
                        }

                      case 27:
                        _context4.prev = 27;

                        if (!_didIteratorError) {
                          _context4.next = 30;
                          break;
                        }

                        throw _iteratorError;

                      case 30:
                        return _context4.finish(27);

                      case 31:
                        return _context4.finish(24);

                      case 32:
                        if (!(newText !== oldText)) {
                          _context4.next = 35;
                          break;
                        }

                        _context4.next = 35;
                        return _fsExtra2.default.writeFile(file, newText, 'utf8');

                      case 35:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, _this2, [[1, 7], [16, 20, 24, 32], [25,, 27, 31]]);
              }));

              return function (_x6) {
                return _ref6.apply(this, arguments);
              };
            }()));

          case 5:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function replaceInFiles(_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
}();

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _es6Promisify = require('es6-promisify');

var _promisifyChildProcess = require('promisify-child-process');

var _parseRepositoryUrl2 = require('./parseRepositoryUrl');

var _parseRepositoryUrl3 = _interopRequireDefault(_parseRepositoryUrl2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref2) {
    var _this = this;

    var packageDirectory = _ref2.packageDirectory,
        name = _ref2.name,
        description = _ref2.description,
        author = _ref2.author,
        keywords = _ref2.keywords,
        git = _ref2.git;

    var packageJsonPath, packageJson, oldName, oldDescription, repository, oldAuthor, _parseRepositoryUrl, oldOrganization, oldRepo, oldRepoPath, replacements, ignore;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            packageJsonPath = _path2.default.resolve(packageDirectory, 'package.json');
            _context2.t0 = JSON;
            _context2.next = 4;
            return _fsExtra2.default.readFile(packageJsonPath, 'utf8');

          case 4:
            _context2.t1 = _context2.sent;
            packageJson = _context2.t0.parse.call(_context2.t0, _context2.t1);
            oldName = packageJson.name, oldDescription = packageJson.description, repository = packageJson.repository, oldAuthor = packageJson.author;

            if (!(!repository || !repository.url)) {
              _context2.next = 9;
              break;
            }

            throw new Error('missing source repository');

          case 9:
            if (!(repository.type !== 'git')) {
              _context2.next = 11;
              break;
            }

            throw new Error('unsupported source repository type: ' + repository.type);

          case 11:
            _context2.next = 13;
            return (0, _promisifyChildProcess.spawn)('git', ['remote', 'add', 'skeleton', repository.url], {
              cwd: packageDirectory,
              stdio: 'inherit'
            });

          case 13:
            _parseRepositoryUrl = (0, _parseRepositoryUrl3.default)(repository.url), oldOrganization = _parseRepositoryUrl.organization, oldRepo = _parseRepositoryUrl.repo;
            oldRepoPath = oldOrganization + '/' + oldRepo;


            (0, _assign2.default)(packageJson, { name: name, description: description });
            if (author) packageJson.author = author;
            if (keywords) packageJson.keywords = keywords;

            if (!git) {
              _context2.next = 20;
              break;
            }

            return _context2.delegateYield( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
              var newRepoPath, _arr, _i, field;

              return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      newRepoPath = git.organization + '/' + git.repo;
                      _arr = ['repository.url', 'homepage', 'bugs.url'];


                      for (_i = 0; _i < _arr.length; _i++) {
                        field = _arr[_i];

                        (0, _lodash.update)(packageJson, field, function (url) {
                          return url && url.replace(oldRepoPath, newRepoPath);
                        });
                      }

                      _context.prev = 3;
                      _context.next = 6;
                      return (0, _promisifyChildProcess.spawn)('git', ['remote', 'set-url', 'origin', packageJson.repository.url], {
                        cwd: packageDirectory,
                        stdio: 'inherit'
                      });

                    case 6:
                      _context.next = 12;
                      break;

                    case 8:
                      _context.prev = 8;
                      _context.t0 = _context['catch'](3);
                      _context.next = 12;
                      return (0, _promisifyChildProcess.spawn)('git', ['remote', 'add', 'origin', packageJson.repository.url], {
                        cwd: packageDirectory,
                        stdio: 'inherit'
                      });

                    case 12:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, _this, [[3, 8]]);
            })(), 't2', 20);

          case 20:
            _context2.next = 22;
            return _fsExtra2.default.writeFile(packageJsonPath, (0, _stringify2.default)(packageJson, null, 2), 'utf8');

          case 22:
            replacements = [[oldDescription, description]];

            if (author) replacements.push([oldAuthor, author]);
            if (git) replacements.push([oldRepoPath, git.organization + '/' + git.repo]);
            replacements.push([oldName, name]);

            _context2.t3 = [_path2.default.join('.git', '**'), _path2.default.join('node_modules', '**'), 'package.json', 'yarn.lock'];
            _context2.t4 = _toConsumableArray3.default;
            _context2.next = 30;
            return readLines(_path2.default.resolve(packageDirectory, '.gitignore')).catch(function () {
              return [];
            });

          case 30:
            _context2.t5 = _context2.sent;
            _context2.t6 = (0, _context2.t4)(_context2.t5);
            ignore = _context2.t3.concat.call(_context2.t3, _context2.t6);


            replaceInFiles(packageDirectory, replacements, { ignore: ignore });

          case 34:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function setUpSkeleton(_x) {
    return _ref.apply(this, arguments);
  }

  return setUpSkeleton;
}();

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  if (find instanceof RegExp) return str.replace(find, replace);
  return str.replace(new RegExp('\\b(?:' + escapeRegExp(find) + ')\\b', 'g'), replace);
}