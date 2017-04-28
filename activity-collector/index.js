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
const refocus = require('./refocus.js');
let auth = {}, activityPromises = [], refocus_url = {};

/**
 * List of projects should be passed as a JSON conf file.
 * @see ./oscon_projects.json
 * Token is optional but advised to use if Github API
 * limits for unauthenticated are too restrictive.
 * @see https://developer.github.com/v3/#rate-limiting
 */
program
  .option('-f, --file <projects>', 'File with projects')
  .option('-t, --token <token>', 'Github OAuth2 Token')
  .option('-r --refocus_url <refocus_url>', 'Refocus API url')
  .parse(process.argv);

// load projects from JSON
const projects = utils.loadProjects(program.file)

// use token for auth if exists
if (program.token) {
  auth = { token: program.token };
}

if (program.refocus_url) {
  refocus_url = program.refocus_url;
}

// create new github object
const gh = new github(auth);

//create new refocus object
const r = new refocus(program.refocus_url);

// fetch & calculate activity for every project
projects.map((project) => {
  activityPromises.push(gh.fetchActivity(project));
})

// try to resolve fetching promises
Promise.all(activityPromises)
.then((results) => {
  console.log('fetching finished.');
  console.log('fetching results:');
  results.map((result) => { console.log(result) });
  // once fetching activity is finished
  // its time to create samples in Refocus
  return r.postSamples(results)
})
.then((refocusResults) => {
  console.log('refocus loading finished.');
  console.log(`refocus loading results: ${JSON.stringify(refocusResults)}`);
})
.catch((err) => {
  console.error(`Error while executing requests. Details: ${err}`);
});