/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Module to access Refocus APIs
 */

var request = require('superagent');

class Refocus {
    /**
     * Create a new Refocus object.
     * @param {Object} [url] - location of Refocus API
     */
    constructor(url) {
      this.__url = url || null;
      this.__root = 'OSCON2017';
    }

    /**
     * Take data for samples and post to Refocus API.
     * @param {Array} [samples] - samples
     * @see https://salesforce.github.io/refocus/docs/01-quickstart.html
     * @return {Promise} - the Promise for the http request
     */
    postSamples(data) {
      return new Promise((resolve, reject) => {
        // create Refocus compatible sample objects
        const samples = data.map((entity) => {
          return {
            name: `${this.__root}.${entity.name}|${entity.aspect}`,
            value: entity.stats.toString(),
            messageCode: entity.stats.toString()
          }
        });
        // post samples to Refocus API
        request
          .post(`${this.__url}/v1/samples/upsert/bulk`)
          .send(samples)
          .set('Accept', 'application/json')
          .end(function(err, res) {
            if (err) reject(err);
            resolve(res);
          });
      });
    }
}

module.exports = Refocus;