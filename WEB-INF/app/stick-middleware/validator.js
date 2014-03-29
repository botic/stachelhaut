var Validator = exports.Validator = function(objectToValidate) {
   var obj = objectToValidate;
   this.validations = {};

   this.addValidation = function(name, value) {
      return this.validations[name] = {
         "name": name,
         "value": value,
         "isValid": true,
         "messages": []
      };
   };

   var Checker = function(validation, stopOnFail) {
      Object.defineProperties(this, {
         "validation": {"value": validation},
         "value": {"value": validation.value},
         "stopOnFail": {"value": stopOnFail === true},
         "isValid": {
            "get": function() {
               return this.validation.isValid === true;
            }
         }
      });

      return this;
   };

   var VoidChecker = function(value) {
      this.value = value;
   };

   Checker.prototype.checkResult = function(passes, message) {
      if (!passes) {
         this.validation.isValid = false;
         this.validation.messages.push(message);

         if (this.stopOnError) {
            return new VoidChecker(this.value);
         }
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
      java.lang.System.out.println("this.value  -->  " + this.value);
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

   Checker.prototype.isDefined = function(message) {
      return this.checkResult(this.value !== undefined, message);
   };

   Checker.prototype.notNull = function(message) {
      return this.checkResult(this.value == null, message);
   };

   Checker.prototype.strictNotNull = function(message) {
      return this.checkResult(this.value === null, message);
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

   // Add functions to the VoidChecker
   for (var fn in Checker.prototype) {
      VoidChecker.prototype[fn] = function() { return this; };
   }

   this.validate = function(key) {
      return new Checker(this.addValidation(key, obj[key]), true);
   };

   this.validateAll = function(key) {
      return new Checker(this.addValidation(key, obj[key]), false);
   };

};

Validator.prototype.hasErrors = function(name) {
    if (name != undefined) {
        return !this.validations.hasOwnProperty(name) || !this.validations[name].isValid;
    }
    return true !== Object.keys(this.validations).every(function(key) {
        return this[key].isValid;
    }, this.validations);
};

Validator.prototype.errorMessages = function(name) {
   if (name != undefined) {
      return this.hasErrors(name) ? this.validations[name].messages : [];
   }

   var messages = [];
   for each (let validation in this.validations) {
      if (!validation.isValid) {
         messages = messages.concat(validation.messages);
      }
   }
   return messages;
};

/**
 * Returns an object suitable for use as template rendering context.
 * This object contains all values stored by their name, an
 * object named `errors` containing the validation failure messages
 * by value name, and a boolean `hasErrors`.
 * @returns {Object} The template context object
 */
Validator.prototype.getTemplateContext = function() {
    var result = {
        "hasErrors": this.hasErrors(),
        "errors": {}
    };
    for each (let validation in this.validations) {
        result[validation.name] = validation.value;
        if (!validation.isValid) {
            result.errors[validation.name] = validation.messages;
        }
    }
    return result;
};