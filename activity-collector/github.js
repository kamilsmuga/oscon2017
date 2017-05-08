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
     * Activity = weekly code additions and deletions +
     *            comments on issues and PRs
     * @param {Object} [project] - object that represents a project
     * @return {Promise} - the Promise for the http request
     */
    fetchActivity(project) {
      let repoStats, issueComments, prComments;
      const repoDetails = this.getUserAndRepoFromProjectUrl(project.url);

      return new Promise((resolve, reject) => {
        // fetch repo stats
        this.getRepoStats(repoDetails)
        .then((result) => {
          repoStats = result.stats;
          // fetch a number of comments on issues
          return this.getIssueComments(repoDetails)
        })
        .then((result) => {
          issueComments = result.comments;
          // fetch a number of comments on PRs
          return this.getPRComments(repoDetails)
        })
        .then((result) => {
          prComments = result.comments;
          // sum everything up
          const totalActivity = repoStats + issueComments + prComments;
          resolve({
            name: project.name,
            repo: `${result.repo.owner}/${result.repo.repo}`,
            stats: totalActivity
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
    getRepoStats(repo) {
      return new Promise((resolve, reject) => {
        this.__gh.repos.getStatsCodeFrequency(repo)
        .then((stats) => {
          const lastWeekActivity = stats.data[stats.data.length - 1];
          if (stats.meta.status == '202 Accepted') reject('Github is calculating stats. Try again later.');
          // the value will be an aggregated adds and deletions
          const theNumber = lastWeekActivity[1] + Math.abs(lastWeekActivity[2]);
          resolve({ repo: repo, stats: theNumber });
        })
        .catch((err) => {
          reject(err);
        })
      });
    }

    /**
     * Queries github for issue comments in a repository.
     * @see https://developer.github.com/v3/issues/comments/#list-comments-in-a-repository
     * @param {Object} [repo] - owner and repo name details
     * @return {Promise} - the Promise for the http request
     * TBD: Handle pagination. Right now results are capped at 100
     */
    getIssueComments(repo) {
      return new Promise((resolve, reject) => {
        let since = new Date();
        since.setDate(since.getDate() - 7);
        this.__gh.issues.getCommentsForRepo({
          owner: repo.owner,
          repo: repo.repo,
          per_page: 100,
          since: since
        })
        .then((stats) => {
          resolve({ repo: repo, comments: stats.data.length });
        })
        .catch((err) => {
          reject(err);
        })
      });
    }

    /**
     * Queries github for PR comments in a repository.
     * @see https://developer.github.com/v3/pulls/comments/#list-comments-in-a-repository
     * @param {Object} [repo] - owner and repo name details
     * @return {Promise} - the Promise for the http request
     * TBD: Handle pagination. Right now results are capped at 100
     */
    getPRComments(repo) {
      return new Promise((resolve, reject) => {
        let since = new Date();
        since.setDate(since.getDate() - 7);
        this.__gh.pullRequests.getCommentsForRepo({
          owner: repo.owner,
          repo: repo.repo,
          per_page: 100,
          since: since
        })
        .then((stats) => {
          resolve({ repo: repo, comments: stats.data.length });
        })
        .catch((err) => {
          reject(err);
        })
      });
    }
}

module.exports = Github;