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
let auth = {}, refocus_url = {};

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

/**
 * STEP 1: Calculate general activity by summing up
 * lines of code, comments on Issues and PRs
 * and push to 'Activity' aspect
 */

// fetch & calculate activity for every project
Promise.all(projects.map(project => gh.fetchActivity(project)))
.then((results) => {
  console.log('General Activity fetching finished.');
  console.log('General Activity fetching results:');
  results.map((result) => { console.log(result) });
  // once fetching activity is finished
  // its time to create samples in Refocus
  return r.postSamples(results)
})
.then((refocusResults) => {
  console.log('General Activity loading to Refocus finished.');
  console.log(`General Activity loading to Refocus results: ${JSON.stringify(refocusResults)}`);
})
.catch((err) => {
  console.error(`Error while executing General Activity requests. Details: ${err}`);
});

/**
 * STEP 2: Calculate LOC activity only
 * and push to 'LOC' aspect
 */

Promise.all(projects.map(project => gh.getRepoStats(project)))
.then((results) => {
  console.log('Repo Stats fetching finished.');
  console.log('Repo Stats fetching results:');
  results.map((result) => { console.log(result) });
  // once fetching activity is finished
  // its time to create samples in Refocus
  return r.postSamples(results)
})
.then((refocusResults) => {
  console.log('Repo Stats loading to Refocus finished.');
  console.log(`Repo Stats loading to Refocus results: ${JSON.stringify(refocusResults)}`);
})
.catch((err) => {
  debugger;
  console.error(`Error while executing Repo Stats requests. Details: ${err}`);
});

/**
 * STEP 3: Calculate comments on Issues activity only
 * and push to 'IssueComments' aspect
 */

Promise.all(projects.map(project => gh.getIssueComments(project)))
.then((results) => {
  console.log('Issue Comments fetching finished.');
  console.log('Issue Comments fetching results:');
  results.map((result) => { console.log(result) });
  // once fetching activity is finished
  // its time to create samples in Refocus
  return r.postSamples(results)
})
.then((refocusResults) => {
  console.log('Issue Comments loading to Refocus finished.');
  console.log(`Issue Comments loading to Refocus results: ${JSON.stringify(refocusResults)}`);
})
.catch((err) => {
  console.error(`Error while executing Issue Comments requests. Details: ${err}`);
});

 /**
  * STEP 4: Calculate comments on PRs activity only
  * and push to 'PRComments' aspect
  */

Promise.all(projects.map(project => gh.getPRComments(project)))
.then((results) => {
  console.log('PR Comments fetching finished.');
  console.log('PR Comments fetching results:');
  results.map((result) => { console.log(result) });
  // once fetching activity is finished
  // its time to create samples in Refocus
  return r.postSamples(results)
})
.then((refocusResults) => {
  console.log('PR Comments loading to Refocus finished.');
  console.log(`PR Comments loading to Refocus results: ${JSON.stringify(refocusResults)}`);
})
.catch((err) => {
  console.error(`Error while executing PR Comments requests. Details: ${err}`);
});
