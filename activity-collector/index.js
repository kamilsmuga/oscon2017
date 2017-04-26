#!/usr/bin/env node

/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 *
 * Main module that invokes the collector.
 * Parses CLI arguments and instruments API calls.
 * Projects to parse and auth info are accepted as a conf file.
 *
 */

const program = require('commander');
const utils = require('./utils.js');
const github = require('./github.js');
let gh, projects, auth = {}, activityPromises = [];

/**
 * List of projects should be passed as a JSON conf file.
 * @see ./oscon_projects.json
 * Token is optional but advised to use if Github API
 * limits for unauthenticated are too restrictive.
 * @see https://developer.github.com/v3/#rate-limiting
 */
program
  .option('-f, --file <projects>', 'File with projects')
  .option('-t, --token <token>', 'OAuth2 Token')
  .parse(process.argv);

// load projects from JSON
projects = utils.loadProjects(program.file)

// use token for auth if exists
if (program.token) {
  auth = { token: program.token };
}

// create new github object
gh = new github(auth);

// fetch & calculate activity for every project
projects.map((project) => {
  activityPromises.push(gh.fetchActivity(project));
})

// try to resolve fetching promises
Promise.all(activityPromises)
.then((results) => {
  console.log('fetching done. results: ' + results);
})
.catch((err) => {
  console.error(`Error while fetching. Err: ${err}`);
});