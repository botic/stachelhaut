var {process} = require("ringo/markdown");
var {markSafe} = require("reinhardt/utils");
var dates = require("ringo/utils/dates");

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
   var start = new Date(2014, 2, 18);

   if (date !== "INVALID" && dates.before(start, date)) {
      return dates.diff(start, date);
   }
   return "0";
};