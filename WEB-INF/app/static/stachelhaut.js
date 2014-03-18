$(document).ready(function() {
   if ($("#add-story-form").length === 1) {
      $("#datepicker").fdatepicker({
         closeButton: false,
         format: "dd-mm-yyyy",
         weekStart: 1
      });
   }

   if ($("#edit-story-form").length === 1) {
      $("#datepicker").fdatepicker({
         closeButton: false,
         format: "dd-mm-yyyy",
         weekStart: 1
      });
   }
});