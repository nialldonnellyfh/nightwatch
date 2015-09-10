var util = require('util');
var events = require('events');
var Utils = require('../../util/utils.js');
var CommandQueue = require('../../core/queue.js');

/**
 * Search for multiple elements on the page using jQuery library.
 *
 * @param {string} selector jQuery selector
 * @param {function} [callback] Optional callback function to be called when the command finishes.
 * @api protocol
 */

function ElementsByJQuery(client, onlyOne) {
  events.EventEmitter.call(this);
  this.client = client;
  this.onlyOne = onlyOne;
  this.protocol = require('../protocol.js')(client);
}

util.inherits(ElementsByJQuery, events.EventEmitter);


ElementsByJQuery.prototype.command = function(selector, callback) {
  var self = this;
  var dummyInstance = new ElementsByJQuery(this.client);
  if (selector === undefined) {
    return this;
  } else {
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    CommandQueue.add("jquery-selector-dummy", dummyInstance, dummyInstance, null, err.stack);

    return this.protocol.executeAsync(
      Utils.injectJQuery,
      [],
      function() {
        return self.protocol.execute(function(selector, onlyOne) {
          if (onlyOne) {
            return Nightwatch_jQuery(selector).filter(":visible").get(0);
          }
          return Nightwatch_jQuery(selector).filter(":visible");
        },
        [selector, self.onlyOne],
        function(result) {
          if (result.value == null) {
            result.value = [];
          }
          dummyInstance.emit('complete');
          callback(result);
        });
    });
  }
};

module.exports = ElementsByJQuery;
