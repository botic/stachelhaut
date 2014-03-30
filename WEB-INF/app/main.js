importPackage(com.google.appengine.api.users);
importPackage(com.google.appengine.api.images);
importPackage(com.google.appengine.api.datastore);
importPackage(com.google.appengine.api.blobstore);

var appengine = require("./appengine");

var {Application} = require("stick");
var app = exports.app = Application();

app.configure("params", "static", "mount", "route");
app.static(module.resolve("./static"), "index.html", "/static");

var response = require("ringo/jsgi/response");

var {Environment} = require("reinhardt");
var env = new Environment({
   loader: module.resolve("WEB-INF/app/templates"),
   filters: require("./filters")
});

app.mount("/stories", module.resolve("./stories"));

app.get("/", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
   } else {

   }

   // Read out all existing stories
   var datastore = DatastoreServiceFactory.getDatastoreService();
   var stories = appengine.mapEntityList(
      datastore.prepare((new Query("Story")).addSort("posted", Query.SortDirection.DESCENDING))
      .asList(FetchOptions.Builder.withLimit(10))
   );

   return response.html(env.getTemplate("frontpage.html").render({
      title: "Bautagebuch - Wohnprojekt Seestern Aspern",
      stories: stories
   }));
});

app.get("/admin", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {

      // Read out all existing stories
      var datastore = DatastoreServiceFactory.getDatastoreService();
      var stories = appengine.mapEntityList(
         datastore.prepare((new Query("Story")).addSort("titleLowerCase", Query.SortDirection.ASCENDING))
         .asList(FetchOptions.Builder.withDefaults())
      );

      return response.html(env.getTemplate("frontpage-admin.html").render({
         title: "Bautagebuch - Wohnprojekt Seestern Aspern",
         user: credentials.currentUser,
         stories: stories
      }));
   }

   return response.redirect(credentials.loginURI);
});

