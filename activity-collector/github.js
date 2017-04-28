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

    /**
     * Auth against Github if token exists
     */
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
      return new Promise((resolve, reject) => {
        const repoDetails = this.getUserAndRepoFromProjectUrl(project.url);
        this.getStats(repoDetails)
        .then((result) => {
          resolve({
            repo: `${result.repo.owner}/${result.repo.repo}`,
            stats: result.stats
          });
        })
        .catch((err) => {
          reject(err);
        });
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

    /**
     * Queries github for code stats frequency.
     * Stats return a weekly aggregate of the number of additions and
     * deletions pushed to a repository.
     * @see https://developer.github.com/v3/repos/statistics/#get-the-number-of-additions-and-deletions-per-week
     * @param {Object} [repo] - owner and repo name details
     * @return {Promise} - the Promise for the http request
     */
    getStats(repo) {
      return new Promise((resolve, reject) => {
        this.__gh.repos.getStatsCodeFrequency(repo)
        .then((stats) => {
          const lastWeekActivity = stats.data[stats.data.length - 1];
          if (!lastWeekActivity) reject('error: no data returned by the Github API');
          // the value will be an aggregated adds and deletions
          const theNumber = lastWeekActivity[1] + Math.abs(lastWeekActivity[2]);
          resolve({ repo: repo, stats: theNumber });
        })
        .catch((err) => {
          reject(err);
        })
      });
    }
}

module.exports = Github;