# 0-60

[![CircleCI](https://circleci.com/gh/jedwards1211/0-60.svg?style=svg)](https://circleci.com/gh/jedwards1211/0-60)
[![Coverage Status](https://codecov.io/gh/jedwards1211/0-60/branch/master/graph/badge.svg)](https://codecov.io/gh/jedwards1211/0-60)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/es2015-library-skeleton.svg)](https://badge.fury.io/js/es2015-library-skeleton)

This is my script for creating an npm package from a skeleton project and
setting up the CI build as fast as possible. Once you've used this you'll never
want to go back to setting up all of that stuff manually.

# Installation

```sh
yarn global add 0-60
```

Or if you want you can run it with `npx`:

```sh
npx 0-60
```

# CLI

## Cloning a skeleton repository

```sh
0-60 clone <REPO URL>
```

`0-60` will prompt you for the new package name, organization, etc:

```
$ 0-60 clone https://github.com/jedwards1211/es2015-library-skeleton.git
? Destination directory: cool-project
Cloning into 'cool-project'...
remote: Enumerating objects: 182, done.
remote: Counting objects: 100% (182/182), done.
remote: Compressing objects: 100% (41/41), done.
remote: Total 1078 (delta 162), reused 150 (delta 140), pack-reused 896
Receiving objects: 100% (1078/1078), 586.17 KiB | 2.78 MiB/s, done.
Resolving deltas: 100% (724/724), done.
? Package name: cool-project
? Package description: made with 0-60!
? Package author: Andy Edwards
? Package keywords: foo,bar
? GitHub organization: jedwards1211
? GitHub repo: cool-project
Installing dependencies...
yarn install v1.13.0
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
✨  Done in 9.17s.
Ready to go!
```

## Pick from preset list of skeleton repos

You don't have to type the repository URL every time. Instead you can configure
a preset list of repositories to pick from by adding them to `~/.0-60.json`.
Then just run `0-60` without arguments, and outside of a repo directory.
`0-60` will prompt you to select which skeleton you want from this list.

Example `~/.0-60.json`:

```json
{
  "skeletons": [
    "jedwards1211/es2015-library-skeleton",
    "jedwards1211/react-library-skeleton",
    "jedwards1211/react-karma-library-skeleton",
    "jedwards1211/untranspiled-js-library-skeleton"
  ]
}
```

```
$ 0-60
? Skeleton repo: (Use arrow keys)
❯ jedwards1211/es2015-library-skeleton
  jedwards1211/react-library-skeleton
  jedwards1211/react-karma-library-skeleton
  jedwards1211/untranspiled-js-library-skeleton
```

## Preparing for CI build

Running `0-60` inside in your repo directory will:

- Create the repository on GitHub
- enable Travis CI (if `.travis.yml` is present)

## Bringing in changes to the skeleton

Just run `git pull skeleton master` (`0-60` keeps the skeleton repository URL in the `skeleton` remote).
I recommend using the CLI in my fork of [merge-package.json](https://github.com/jedwards1211/merge-package.json) to automatically fix merge conflicts in `package.json`. (Install with `npm i -g jedwards1211/merge-package.json#cli` and then just run `merge-package.json` in the project directory after pulling.)
