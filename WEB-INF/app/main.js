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
   loader: module.resolve("WEB-INF/app/templates")
});

var isValidId = function(id) {
   return /^([0-9]+)$/.test(id);
};

app.get("/", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
   } else {

   }

   // Read out all existing stories
   var datastore = DatastoreServiceFactory.getDatastoreService();
   var stories = appengine.mapEntityList(
      datastore.prepare((new Query("Story")).addSort("created", Query.SortDirection.ASCENDING))
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

app.get("/stories/add", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      return response.html(env.getTemplate("stories-add.html").render({
         title: "Bautagebuch - Wohnprojekt Seestern Aspern",
         user: credentials.currentUser
      }));
   }

   return response.redirect(credentials.loginURI);
});

app.post("/stories/add", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
         if (req.postParams.title && req.postParams.title.length > 0
            && req.postParams.title.length < 1000 && req.postParams.text.length < 100000) {

         var datastore = DatastoreServiceFactory.getDatastoreService();
         var story = new Entity("Story");
         story.setProperty("title", req.postParams.title);
         story.setProperty("titleLowerCase", req.postParams.title.toLowerCase());
         story.setProperty("text", req.postParams.text);
         story.setProperty("created", new java.util.Date());
         story.setProperty("creator", credentials.currentUser);
         datastore.put(story);

         return response.redirect("/stories/" + story.getKey().getId());
      }
   }

   return response.redirect(credentials.loginURI);
});

app.get("/stories/:id", function(req, id) {
   if (!isValidId(id)) {
      return response.forbidden().html("<h1>Forbidden</h1>");
   }

   var datastore = DatastoreServiceFactory.getDatastoreService();
   var storyEntity;
   try {
      storyEntity = datastore.get(KeyFactory.createKey("Story", java.lang.Long.parseLong(id)));
   } catch(e if e.javaException instanceof EntityNotFoundException) {
      return response.notFound().html("<h1>Story not found</h1>");
   } catch (e) {
      return response.error().html("<h1>Internal error</h1>");
   }

   var story = appengine.mapProperties(storyEntity);
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      return response.html(env.getTemplate("story.html").render({
         title: story.title + " - Wohnprojekt Seestern Aspern",
         user: credentials.currentUser,
         story: story
      }));
   } else {
      return response.html(env.getTemplate("story.html").render({
         title: story.title + " - Wohnprojekt Seestern Aspern",
         story: story
      }));
   }
});

app.get("/stories/:id/edit", function(req, id) {
   if (!isValidId(id)) {
      return response.forbidden().html("<h1>Forbidden</h1>");
   }

   var datastore = DatastoreServiceFactory.getDatastoreService();
   var storyEntity;
   try {
      storyEntity = datastore.get(KeyFactory.createKey("Story", java.lang.Long.parseLong(id)));
   } catch(e if e.javaException instanceof EntityNotFoundException) {
      return response.notFound().html("<h1>Story not found</h1>");
   } catch (e) {
      return response.error().html("<h1>Internal error</h1>");
   }

   var story = appengine.mapProperties(storyEntity);
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      return response.html(env.getTemplate("story-edit.html").render({
         title: story.title + " - Wohnprojekt Seestern Aspern",
         user: credentials.currentUser,
         story: story
      }));
   } else {
      return response.redirect("/stories/:id");
   }
});

app.post("/stories/:id/edit", function (req, id) {
   if (!isValidId(id)) {
      return response.forbidden().html("<h1>Forbidden</h1>");
   }

   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
         if (req.postParams.title && req.postParams.title.length > 0
            && req.postParams.title.length < 1000 && req.postParams.text.length < 100000) {

         var datastore = DatastoreServiceFactory.getDatastoreService();
         var storyEntity;
         try {
            storyEntity = datastore.get(KeyFactory.createKey("Story", java.lang.Long.parseLong(id)));
         } catch(e if e.javaException instanceof EntityNotFoundException) {
            return response.notFound().html("<h1>Story not found</h1>");
         } catch (e) {
            return response.error().html("<h1>Internal error</h1>");
         }
         storyEntity.setProperty("title", req.postParams.title);
         storyEntity.setProperty("titleLowerCase", req.postParams.title.toLowerCase());
         storyEntity.setProperty("text", req.postParams.text);
         datastore.put(storyEntity);

         return response.redirect("/stories/" + storyEntity.getKey().getId());
      }
   }

   return response.redirect(credentials.loginURI);
});