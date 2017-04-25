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

import GitHub from 'github-api';

// basic auth
var gh = new GitHub({
  token: 'MY_OAUTH_TOKEN'
});