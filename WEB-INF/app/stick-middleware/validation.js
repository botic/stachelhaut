var strings = require("ringo/utils/strings");

exports.middleware = function validation(next, app) {
   return function validation(req) {
      var validatorParams = new Validator(req.params);
      var validatorPostParams = new Validator(req.postParams);
      var validatorQueryParams = new Validator(req.queryParams);

      // req.params
      req.validate = function(param) {
         return validatorParams.validate(param);
      };

      req.isValid = function() {
         return validatorParams.isValid();
      };

      Object.defineProperty(req, "errors", {
         get: function() {
            return validatorParams.errors;
         },
         enumerable: true
      });

      // req.postParams
      req.validatePost = function(param) {
         return validatorPostParams.validate(param);
      };

      req.isValidPost = function() {
         return validatorPostParams.isValid();
      };

      Object.defineProperty(req, "errorsPost", {
         get: function() {
            return validatorPostParams.errors;
         },
         enumerable: true
      });

      // req.queryParams
      req.validateQuery = function(param) {
         return validatorQueryParams.validate(param);
      };

      req.isValidQuery = function() {
         return validatorQueryParams.isValid();
      };

      Object.defineProperty(req, "errorsQuery", {
         get: function() {
            return validatorQueryParams.errors;
         },
         enumerable: true
      });

      return next(req);
   };
};

var Validator = exports.Validator = function(map) {
   var errors = [];

   Object.defineProperty(this, "errors", {
      get: function() {
         return errors;
      },
      enumerable: true
   });

   var Checker = function(key) {
      this.value = map[key];
      this.stopOnError = false;
   };

   Checker.prototype.checkResult = function(checkResult, message) {
      if (!checkResult && (!this.stopOnError || errors.length === 0)) {
         errors.push(message);
      }
      return this;
   };

   Checker.prototype.isAlpha = function(message) {
      return this.checkResult(strings.isAlpha(this.value), message);
   };

   Checker.prototype.isAlphanumeric = function(message) {
      return this.checkResult(strings.isAlphanumeric(this.value), message);
   };

   Checker.prototype.isDateFormat = function(message) {
      return this.checkResult(strings.isDateFormat(this.value), message);
   };

   Checker.prototype.isUrl = function(message) {
      return this.checkResult(strings.isUrl(this.value), message);
   };

   Checker.prototype.isEmail = function(message) {
      return this.checkResult(strings.isEmail(this.value), message);
   };

   Checker.prototype.isFileName = function(message) {
      return this.checkResult(strings.isFileName(this.value), message);
   };

   Checker.prototype.isHexColor = function(message) {
      return this.checkResult(strings.isHexColor(this.value), message);
   };

   Checker.prototype.isNumeric = function(message) {
      return this.checkResult(strings.isNumeric(this.value), message);
   };

   Checker.prototype.isInt = function(message) {
      return this.checkResult(strings.isInt(this.value), message);
   };

   Checker.prototype.isFloat = function(message) {
      return this.checkResult(strings.isFloat(this.value), message);
   };

   Checker.prototype.isNumber = function(message) {
      return this.checkResult((strings.isFloat(this.value) || strings.isInt(this.value)), message);
   };

   Checker.prototype.minLength = function(min, message) {
      return this.checkResult((this.value.length >= min), message);
   };

   Checker.prototype.maxLength = function(max, message) {
      return this.checkResult((this.value.length <= max), message);
   };

   Checker.prototype.lengthBetween = function(min, max, message) {
      return this.checkResult((this.value.length >= min && this.value.length <= max), message);
   };

   Checker.prototype.hasLength = function(len, message) {
      return this.checkResult((this.value.length === len), message);
   };

   Checker.prototype.equal = function(obj, message) {
      return this.checkResult((this.value == obj), message);
   };

   Checker.prototype.strictEqual = function(obj, message) {
      return this.checkResult((this.value === obj), message);
   };

   Checker.prototype.isTrue = function(message) {
      return this.checkResult(this.value, message);
   };

   Checker.prototype.isFalse = function(message) {
      return this.checkResult(!this.value, message);
   };

   Checker.prototype.matches = function(regex, message) {
      return this.checkResult(regex.test(this.value), message);
   };

   Checker.prototype.passes = function(func, message) {
      if (typeof func !== "function") {
         throw "Validator function argument is not a function!";
      }

      return this.checkResult(func(this.value) === true, message);
   };

   /*** Sanitizers ***/
   Checker.prototype.toDate = function () {
      var date = Date.parse(this.value);
      this.value = !isNaN(date) ? new Date(date) : null;
      return this.value;
   };

   Checker.prototype.toFloat = function () {
      this.value = parseFloat(this.value);
      return this.value;
   };

   Checker.prototype.toInt = function (radix) {
      this.value = parseInt(this.value, radix || 10);
      return this.value;
   };

   Checker.prototype.toBoolean = function (strictTrue) {
      if (strictTrue) {
         this.value = this.value === "1" || this.value === "true";
      } else {
         this.value = this.value !== "0" && this.value !== "false" && this.value !== "";
      }

      return this.value;
   };

   this.validate = function(key) {
      return new Checker(key);
   };

   this.reset = function() {
      errors = [];
   };

   this.isValid = function() {
      return errors.length === 0;
   };

};