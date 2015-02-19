importPackage(com.google.appengine.api.users);
importPackage(com.google.appengine.api.images);
importPackage(com.google.appengine.api.datastore);
importPackage(com.google.appengine.api.blobstore);

var PAGE_SIZE = 6;

var appengine = require("./appengine");

var {Application} = require("stick");
var app = exports.app = Application();

app.configure("params", "mount", "route");

var response = require("ringo/jsgi/response");

var {Environment} = require("reinhardt");
var env = new Environment({
   loader: module.resolve("WEB-INF/app/templates"),
   filters: require("./filters")
});

app.mount("/stories", module.resolve("./stories"));

app.get("/", function (req) {
   var credentials = appengine.getCredentials(req);

   // Read out all existing stories
   var datastore = DatastoreServiceFactory.getDatastoreService();
   var fetchOptions = FetchOptions.Builder.withLimit(PAGE_SIZE);

   var startCursor = req.queryParams["cursor"];
   if (startCursor != null) {
      fetchOptions.startCursor(Cursor.fromWebSafeString(startCursor));
   }

   var results = datastore.prepare(
      new Query("Story")
         .addFilter("deleted", Query.FilterOperator.EQUAL, false)
         .addSort("posted", Query.SortDirection.DESCENDING)
   ).asQueryResultList(fetchOptions);

   var stories = appengine.mapEntityList(results);

   return response.html(env.getTemplate("frontpage.html").render({
      title: "Bautagebuch - Wohnprojekt Seestern Aspern",
      stories: stories,
      user: credentials.currentUser,
      nextCursor: (results.size() === PAGE_SIZE ? results.getCursor().toWebSafeString() : "")
   }));
});

app.get("/admin", function (req) {
   var credentials = appengine.getCredentials(req, "/admin", "/");
   if (credentials.isLoggedIn) {

      // Read out all existing stories
      var datastore = DatastoreServiceFactory.getDatastoreService();
      var stories = appengine.mapEntityList(
         datastore.prepare(
            new Query("Story")
            .addFilter("deleted", Query.FilterOperator.EQUAL, false)
            .addSort("posted", Query.SortDirection.DESCENDING)
         )
         .asList(FetchOptions.Builder.withDefaults())
      );

      return response.html(env.getTemplate("frontpage-admin.html").render({
         title: "Bautagebuch - Wohnprojekt Seestern Aspern",
         user: credentials.currentUser,
         isAdmin: credentials.isAdmin,
         logoutURI: credentials.logoutURI,
         stories: stories
      }));
   }

   return response.redirect(credentials.loginURI);
});

app.get("/version", function (req) {
   var engine = require("ringo/engine");
   return response.text("Running on Ringo " + engine.version.join("."));
});