var strings = require("ringo/utils/strings");
var {Validator} = require("./validator");

exports.middleware = function validation(next, app) {
   return function validation(req) {
      var validator = new Validator(req.method === "POST" ? req.postParams : req.queryParams);

      req.validate = function(key) {
         return validator.validate(key);
      };

      req.validateAll = function(key) {
         return validator.validateAll(key);
      };

      req.hasErrors = function() {
         return validator.hasErrors();
      };

      req.errorMessages = function() {
         return validator.errorMessages();
      };

      req.getTemplateContext = function() {
         return validator.getTemplateContext();
      };

      return next(req);
   };
};