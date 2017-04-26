/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Module with useful helper functions.
 */

const fs = require('fs');

/**
 * Reads a JSON file with projects and creates Project objects.
 * @param {File} [projectsJSON] - JSON file with projects to parse
 * @return {Array[Project]} - array of Project objects
 */
function loadProjects(projectsJSON) {
  // let's read the file and parse it to JSON
  if (!projectsJSON) return;
  const content = fs.readFileSync(projectsJSON);
  return JSON.parse(content).projects;
}

module.exports = {
  loadProjects
}