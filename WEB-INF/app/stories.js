importPackage(com.google.appengine.api.users);
importPackage(com.google.appengine.api.images);
importPackage(com.google.appengine.api.datastore);
importPackage(com.google.appengine.api.blobstore);

var appengine = require("./appengine");

var {Application} = require("stick");
var app = exports.app = Application();

app.configure("params", module.resolve("./stick-middleware/validation"), "route");

var response = require("ringo/jsgi/response");
var {Environment} = require("reinhardt");
var env = new Environment({
   loader: module.resolve("WEB-INF/app/templates"),
   filters: require("./filters")
});

var dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/;
var dateFormat = new java.text.SimpleDateFormat("dd-MM-yyyy");

app.get("/add", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      return response.html(env.getTemplate("stories-add.html").render({
         title: "Bautagebuch - Wohnprojekt Seestern Aspern",
         user: credentials.currentUser,
         now: new Date()
      }));
   }

   return response.redirect(credentials.loginURI);
});

app.post("/add", function (req) {
   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      req.validate("title").isDefined("Title is missing!").minLength(3, "Please specify a title!").maxLength(500, "Title is too long! Limit is 500 characters.");
      req.validate("teaser").isDefined("Teaser missing!").maxLength(100000, "Teaser is too long! Limit is 100.000 characters.");
      req.validate("text").isDefined("Text missing!").maxLength(100000, "Text is too long! Limit is 100.000 characters.");
      req.validate("posted").isDefined("Date missing!").matches(dateRegex, "Invalid date!");

      if (!req.hasErrors()) {
         var datastore = DatastoreServiceFactory.getDatastoreService();
         var story = new Entity("Story");
         story.setProperty("title", req.postParams.title);
         story.setProperty("titleLowerCase", req.postParams.title.toLowerCase());
         story.setUnindexedProperty("teaser", new Text(req.postParams.teaser.replace(/(\r\n|\n|\r)/gm," ")));
         story.setUnindexedProperty("text", new Text(req.postParams.text));
         story.setProperty("posted", dateFormat.parse(req.postParams.posted));
         story.setProperty("created", new java.util.Date());
         story.setProperty("creator", credentials.currentUser);
         datastore.put(story);

         return response.redirect("/stories/" + story.getKey().getId());
      }
   }

   return response.redirect(credentials.loginURI);
});

app.get("/:id", function(req, id) {
   if (!appengine.isValidId(id)) {
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

app.get("/:id/edit", function(req, id) {
   if (!appengine.isValidId(id)) {
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
      return response.redirect("/stories/" + id);
   }
});

app.post("/:id/edit", function (req, id) {
   if (!appengine.isValidId(id)) {
      return response.forbidden().html("<h1>Forbidden</h1>");
   }

   var credentials = appengine.getCredentials(req);
   if (credentials.isLoggedIn) {
      req.validate("title").isDefined("Title is missing!").minLength(3, "Please specify a title!").maxLength(500, "Title is too long! Limit is 500 characters.");
      req.validate("teaser").isDefined("Teaser missing!").maxLength(100000, "Teaser is too long! Limit is 100.000 characters.");
      req.validate("text").isDefined("Text missing!").maxLength(100000, "Text is too long! Limit is 100.000 characters.");
      req.validate("posted").isDefined("Date missing!").matches(dateRegex, "Invalid date!");

      if (!req.hasErrors()) {
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
         storyEntity.setUnindexedProperty("teaser", new Text(req.postParams.teaser.replace(/(\r\n|\n|\r)/gm," ")));
         storyEntity.setUnindexedProperty("text", new Text(req.postParams.text));
         storyEntity.setProperty("posted", dateFormat.parse(req.postParams.posted));
         datastore.put(storyEntity);

         return response.redirect("/stories/" + storyEntity.getKey().getId());
      } else {
         return response.bad().html("Error in request!");
      }
   }

   return response.redirect(credentials.loginURI);
});