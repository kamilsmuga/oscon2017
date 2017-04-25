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

/**
 * List of projects should be passed as a JSON conf file.
 * @see ./oscon_projects.json
 * Username and password are optional but advised to use
 * if Github API limits for no auth are too restrictive.
 * @see https://developer.github.com/v3/#rate-limiting
 */
program
  .arguments('<list_of_projects_file>')
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .action((file) => {
    console.log(`user: ${program.username}
      pass: ${program.password}
      file: ${file}`);
  })
  .parse(process.argv);