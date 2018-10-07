#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var loadConfig = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.t0 = JSON;
            _context.next = 4;
            return _fsExtra2.default.readFile(_path2.default.join(_os2.default.homedir(), '.0-60.json'), 'utf8');

          case 4:
            _context.t1 = _context.sent;
            return _context.abrupt('return', _context.t0.parse.call(_context.t0, _context.t1));

          case 8:
            _context.prev = 8;
            _context.t2 = _context['catch'](0);
            return _context.abrupt('return', {});

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));

  return function loadConfig() {
    return _ref.apply(this, arguments);
  };
}();

var cli = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var git, packageDirectory, remotes, skeleton, _ref3, _ref4, name, description, author, keywords, organization, repo;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return gitPromise;

          case 2:
            git = _context2.sent;
            packageDirectory = process.cwd();
            remotes = void 0;
            _context2.prev = 5;
            _context2.t0 = _set2.default;
            _context2.next = 9;
            return (0, _promisifyChildProcess.spawn)(git, ['remote']);

          case 9:
            _context2.t1 = _context2.sent.stdout.toString('utf8').split(/\r\n|\r|\n/mg);
            remotes = new _context2.t0(_context2.t1);
            _context2.next = 28;
            break;

          case 13:
            _context2.prev = 13;
            _context2.t2 = _context2['catch'](5);
            skeleton = void 0;
            _context2.next = 18;
            return promptForCloneSkeleton();

          case 18:
            _ref3 = _context2.sent;
            skeleton = _ref3.skeleton;
            packageDirectory = _ref3.packageDirectory;
            _context2.next = 23;
            return (0, _promisifyChildProcess.spawn)(git, ['clone', skeleton, packageDirectory], { stdio: 'inherit' });

          case 23:
            _context2.t3 = _set2.default;
            _context2.next = 26;
            return (0, _promisifyChildProcess.spawn)('git', ['remote'], { cwd: packageDirectory });

          case 26:
            _context2.t4 = _context2.sent.stdout.toString('utf8').split(/\r\n|\r|\n/mg);
            remotes = new _context2.t3(_context2.t4);

          case 28:
            process.chdir(packageDirectory);

            if (!remotes.has('skeleton')) {
              _context2.next = 32;
              break;
            }

            _context2.next = 54;
            break;

          case 32:
            _context2.next = 34;
            return promptForSetUpSkeleton(packageDirectory);

          case 34:
            _ref4 = _context2.sent;
            name = _ref4.name;
            description = _ref4.description;
            author = _ref4.author;
            keywords = _ref4.keywords;
            organization = _ref4.organization;
            repo = _ref4.repo;
            _context2.next = 43;
            return (0, _setUpSkeleton2.default)({
              packageDirectory: packageDirectory,
              name: name,
              description: description,
              author: author,
              keywords: keywords,
              git: {
                organization: organization,
                repo: repo
              }
            });

          case 43:

            console.error('Installing dependencies...'); // eslint-disable-line no-console
            _context2.next = 46;
            return (0, _fileExists2.default)(_path2.default.join(packageDirectory, 'yarn.lock'));

          case 46:
            if (!_context2.sent) {
              _context2.next = 51;
              break;
            }

            _context2.next = 49;
            return (0, _promisifyChildProcess.spawn)('yarn', { cwd: packageDirectory, stdio: 'inherit' });

          case 49:
            _context2.next = 53;
            break;

          case 51:
            _context2.next = 53;
            return (0, _promisifyChildProcess.spawn)('npm', ['install'], { cwd: packageDirectory, stdio: 'inherit' });

          case 53:

            console.error('Ready to go!'); // eslint-disable-line no-console

          case 54:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[5, 13]]);
  }));

  return function cli() {
    return _ref2.apply(this, arguments);
  };
}();

var promptForCloneSkeleton = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var _ref6, skeletons, _ref7, skeleton, directory;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return configPromise;

          case 2:
            _ref6 = _context3.sent;
            skeletons = _ref6.skeletons;
            _context3.next = 6;
            return _inquirer2.default.prompt([skeletons ? { type: 'list', name: 'skeleton', choices: skeletons, message: 'Skeleton repo:', validate: required } : { type: 'input', name: 'skeleton', message: 'Skeleton repo:', validate: required }, { type: 'input', name: 'directory', message: 'Destination directory:', validate: required }]);

          case 6:
            _ref7 = _context3.sent;
            skeleton = _ref7.skeleton;
            directory = _ref7.directory;
            return _context3.abrupt('return', { skeleton: skeleton, packageDirectory: directory });

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function promptForCloneSkeleton() {
    return _ref5.apply(this, arguments);
  };
}();

var promptForSetUpSkeleton = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(packageDirectory) {
    var packageJson, repositoryUrl, stdout, defaultAuthor;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.t0 = JSON;
            _context4.next = 3;
            return _fsExtra2.default.readFile(_path2.default.join(packageDirectory, 'package.json'), 'utf8');

          case 3:
            _context4.t1 = _context4.sent;
            packageJson = _context4.t0.parse.call(_context4.t0, _context4.t1);
            repositoryUrl = void 0;
            _context4.prev = 6;
            _context4.next = 9;
            return (0, _promisifyChildProcess.spawn)('git', ['remote', 'get-url', 'origin'], { cwd: packageDirectory });

          case 9:
            stdout = _context4.sent.stdout.toString('utf8').trim();

            repositoryUrl = (0, _parseRepositoryUrl2.default)(stdout);
            _context4.next = 16;
            break;

          case 13:
            _context4.prev = 13;
            _context4.t2 = _context4['catch'](6);

            console.error(_context4.t2.stack); // eslint-disable-line no-console

          case 16:
            defaultAuthor = void 0;
            _context4.prev = 17;
            _context4.next = 20;
            return (0, _promisifyChildProcess.spawn)('git', ['config', 'user.name']);

          case 20:
            defaultAuthor = _context4.sent.stdout.toString('utf8').trim();
            _context4.next = 26;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t3 = _context4['catch'](17);

            defaultAuthor = packageJson.author;

          case 26:
            _context4.next = 28;
            return _inquirer2.default.prompt([{
              type: 'input',
              name: 'name',
              message: 'Package name:',
              default: _path2.default.basename(packageDirectory),
              validate: required
            }, {
              type: 'input',
              name: 'description',
              message: 'Package description:',
              validate: required
            }, {
              type: 'input',
              name: 'author',
              default: defaultAuthor,
              message: 'Package author:',
              validate: required
            }, {
              type: 'input',
              name: 'keywords',
              message: 'Package keywords:',
              transformer: function transformer(text) {
                return text.split(/\s*,\s*|\s+/g);
              }
            }, {
              type: 'input',
              name: 'organization',
              default: function _default(_ref9) {
                var name = _ref9.name;

                var match = /^@(.*?)\//.exec(name);
                if (match) return match[1];
                return repositoryUrl && repositoryUrl.organization;
              },
              message: 'GitHub organization:',
              validate: required
            }, {
              type: 'input',
              name: 'repo',
              message: 'GitHub repo:',
              default: function _default(_ref10) {
                var name = _ref10.name;
                return name.replace(/^@(.*?)\//, '');
              },
              validate: required
            }]);

          case 28:
            return _context4.abrupt('return', _context4.sent);

          case 29:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[6, 13], [17, 23]]);
  }));

  return function promptForSetUpSkeleton(_x) {
    return _ref8.apply(this, arguments);
  };
}();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _promisifyChildProcess = require('promisify-child-process');

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _setUpSkeleton = require('./setUpSkeleton');

var _setUpSkeleton2 = _interopRequireDefault(_setUpSkeleton);

var _parseRepositoryUrl = require('./parseRepositoryUrl');

var _parseRepositoryUrl2 = _interopRequireDefault(_parseRepositoryUrl);

var _fileExists = require('./fileExists');

var _fileExists2 = _interopRequireDefault(_fileExists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var required = function required(s) {
  return Boolean(s) || 'required';
};

var configPromise = loadConfig();
var gitPromise = (0, _promisifyChildProcess.spawn)('which', ['hub']).then(function () {
  return 'hub';
}, function () {
  return 'git';
});

cli().then(function () {
  return process.exit(0);
}, function (err) {
  console.error(err.message); // eslint-disable-line no-console
  if (err.stdout) console.error(err.stdout.toString('utf8')); // eslint-disable-line no-console
  if (err.stderr) console.error(err.stderr.toString('utf8')); // eslint-disable-line no-console
  process.exit(1);
});

exports.default = cli;