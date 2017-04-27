/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Module to access Github APIs
 */

const gh = require('github');

class Github {
    /**
     * Create a new GitHub object.
     * @param {Object} [auth] - token to authenticate to Github. If auth is
     *   not provided requests will be made unauthenticated
     */
    constructor(auth) {
      this.__auth = auth || null;
      this.__gh = new gh();
      this.authenticate();
    }

    authenticate() {
      if (this.__auth.token) {
        this.__gh.authenticate({
          type: 'token',
          token: this.__auth.token
        });
      }
    }

    /**
     * Fetch and calculate activity for a particular project.
     * @param {Object} [project] - object that represents a project
     * @return {Promise} - the Promise for the http request
     */
    fetchActivity(project) {
      let theNumber;
      const repoDetails = this.getUserAndRepoFromProjectUrl(project.url);
      this.getStats(repoDetails)
      .then((result) => {
        debugger;
        theNumber = JSON.parse(result);
        console.log(`REPO: ${result.repo.owner}/${result.repo.repo} Stats: ${theNumber}`);
      })
      .catch((err) => {
        console.error(err);
      });
    }

    /**
     * Breaks down url and parses user and repo info.
     * @param {String} [url] - url to a github repo
     * @return {Object} - object containing user and repo info
     */
    getUserAndRepoFromProjectUrl(url) {
      // example url https://github.com/salesforce/refocus
      const parts = url.split('/');
      return {
        owner: parts[parts.length - 2],
        repo : parts[parts.length - 1]
      };
    }

    getStats(repo) {
      return new Promise((resolve, reject) => {
        this.__gh.repos.getStatsCodeFrequency(repo)
        .then((stats) => {
          resolve({ repo: repo, stats: stats });
        })
        .catch((err) => {
          reject(err)
        })
      });
    }
}

module.exports = Github;