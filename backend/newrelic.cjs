'use strict'
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'optiohire'],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  /**
   * This setting controls whether or not the agent reports to New Relic.
   */
  agent_enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    /**
     * Level at which to log. 'info' is recommended.
     */
    level: 'info'
  },
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be collected for all traces, unless otherwise specified.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in lowercase.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxy-authorization',
      'request.headers.set-cookie',
      'request.headers.x-api-key',
      'request.headers.x-csrf-token',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxy-authorization',
      'response.headers.set-cookie'
    ]
  }
}
