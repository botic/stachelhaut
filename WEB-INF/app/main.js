importPackage(com.google.appengine.api.users);
importPackage(com.google.appengine.api.images);
importPackage(com.google.appengine.api.datastore);
importPackage(com.google.appengine.api.blobstore);

var appengine = require("./appengine");

var {Application} = require("stick");
var app = exports.app = Application();

app.configure("static", "mount", "route");
app.static(module.resolve("./static"), "index.html", "/static");

var response = require("ringo/jsgi/response");

var {Environment} = require("reinhardt");
var env = new Environment({
   loader: module.resolve("WEB-INF/app/templates")
});

app.get("/", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
   } else {}

   return response.html(env.getTemplate("frontpage.html").render({
      title: "Bautagebuch - Wohnprojekt Seestern Aspern"
   }));
});

app.get("/admin", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      return response.text("done.");
   }

   return response.redirect(credentials.loginURI);
});