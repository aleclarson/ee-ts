#!/usr/bin/env bash
set -e

runScript() {
  eval "${NPM_BIN:-npm} run $@"
}

if [[ "master" == "$(git rev-parse --abbrev-ref HEAD)" ]]; then
  runScript "build"
  runScript "test"
fi
