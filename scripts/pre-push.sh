#!/usr/bin/env bash
set -e

runScript() {
  eval "${NPM_BIN:-npm} run $@"
}

if [[ "master" == "$(git rev-parse --abbrev-ref HEAD)" ]]; then
  if [[ ! -z "$(git status --porcelain)" ]]; then
    git stash -u
    function cleanup {
      git stash pop
    }
    trap cleanup EXIT
  fi

  runScript "test"
fi
