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

const gh = require('github-api');

class Github {
    /**
     * Create a new GitHub object.
     * @param {Object} [auth] - token to authenticate to Github. If auth is
     *   not provided requests will be made unauthenticated
     */
    constructor(auth) {
      this.__auth = auth || {};
      this.__gh = new gh(this.__auth);
    }

    /**
     * Fetch and calculate activity for a particular project.
     * @param {Object} [project] - object that represents a project
     * @return {Promise} - the Promise for the http request
     */
    fetchActivity(project) {
      let { user, repoName } = this.getUserAndRepoFromProjectUrl(project.url);
      let repo = this.__gh.getRepo(user, repoName);
      let noOfCommits;

      this.getCommits(repo)
      .then((result) => {
        noOfCommits = result.commits;
        console.log(`REPO: ${result.repo.__fullname} COMMITS: ${noOfCommits}`);
      })
      .catch((err) => {
        console.error(err);
      })
      // repo.getDetails()
      // .then((details) => {
      //   debugger;
      // })
      // .catch((err) => {
      //   console.error(err);
      // })
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
        user: parts[parts.length - 2],
        repoName : parts[parts.length - 1]
      };
    }

    getCommits(repo) {
      return new Promise((resolve, reject) => {
        let since = new Date();
        since.setDate(since.getDate() - 7);
        let options = {};
        options.since = since;
        let url = `/repos/${repo.__fullname}/commits`;
        //return this._request('GET', `/repos/${this.__fullname}/commits`, options)
        return repo._requestAllPages('GET', `/repos/${repo.__fullname}/commits`, options)
        //repo.listCommits({ since: since })
        .then((details) => {
          debugger;
          resolve({ repo: repo, commits: details.data.length });
        })
        .catch((err) => {
          reject(err)
        })
      });
    }
}

module.exports = Github;