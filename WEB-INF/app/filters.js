var {process} = require("commonmark");
var {markSafe} = require("reinhardt/utils");
var dates = require("ringo/utils/dates");

var log = require("ringo/logging").getLogger(module.id);

exports.markdown = function(value) {
   return markSafe(process(value));
};

exports.href = function(entity) {
   if (entity.kind === "Story") {
      return "/stories/" + entity.id;
   }

   return "";
};

exports.dateDiff = function(date) {
   var start = new Date(2014, 2, 20);

   if (date !== "INVALID") {
      return (dates.before(date, start) ? "\u002d" : "") + dates.diff(start, date);
   }

   return "0";
};