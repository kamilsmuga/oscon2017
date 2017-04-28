#!/usr/bin/env bash

YOUR_REFOCUS_URL="http://opensource-mon.herokuapp.com"

jq -c '.projects[]' oscon_subjects.json | while read i; do
  curl -v -H "Accept: application/json" -H "Content-type: application/json" -X POST -d $i $YOUR_REFOCUS_URL/v1/subjects/OSCON2017/child
done
