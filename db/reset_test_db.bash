#!/usr/bin/env bash

$(> db/test.sqlite)

cat db/migrate.sql | sqlite3 db/test.sqlite
