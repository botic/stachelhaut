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
   return response.html(env.getTemplate("frontpage.html").render({
         title: "Bautagebuch - Wohnprojekt Seestern Aspern"
      }));
});