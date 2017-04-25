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
 * Token is optional but advised to use if Github API
 * limits for unauthenticated are too restrictive.
 * @see https://developer.github.com/v3/#rate-limiting
 */
program
  .arguments('<list_of_projects_file>')
  .option('-t, --token <token>', 'OAuth2 Token')
  .action((file) => {
    console.log(`token: ${program.token}
      file: ${file}`);
  })
  .parse(process.argv);