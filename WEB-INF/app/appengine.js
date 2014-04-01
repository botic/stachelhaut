importPackage(com.google.appengine.api.users);

var log = require("ringo/logging").getLogger(module.id);

var getCredentials = exports.getCredentials = function(req, loginURI, logoutURI) {
   var requestURI = req.env.servletRequest.getRequestURI();
   var userService = UserServiceFactory.getUserService();
   var principal = req.env.servletRequest.getUserPrincipal();
   var isLoggedIn = false;

   try {
      isLoggedIn = userService.isUserLoggedIn();
   } catch (e) {
      isLoggedIn = false;
   }

   return {
      isLoggedIn: isLoggedIn,
      isAdmin: !isLoggedIn ? false : userService.isUserAdmin(),
      currentUser: !isLoggedIn ? null : userService.getCurrentUser(),
      principal: !isLoggedIn ? null : principal,
      loginURI: userService.createLoginURL(loginURI || requestURI),
      logoutURI: userService.createLogoutURL(logoutURI || requestURI)
   };
};

var mapProperties = exports.mapProperties = function(entity) {
   var parentKey = entity.getParent();
   var map = entity.getProperties();
   var obj = {
      kind: entity.getKind(),
      id: entity.getKey().getId(),
      parentId: (parentKey !== null ? parentKey.getId() : null)
   };

   map.keySet().toArray().forEach(function(key) {
      var value = map.get(key);
      if (value instanceof java.util.Date) {
         obj[key] = new Date(value.getTime());
      } else if (value instanceof com.google.appengine.api.datastore.Text) {
         obj[key] = value.getValue();
      } else {
         obj[key] = value;
      }
   });

   return obj;
};

var mapEntityList = exports.mapEntityList = function (entityList) {
   var arr = [];
   for (var i = 0; i < entityList.size(); i++) {
      arr.push(mapProperties(entityList.get(i)));
   }
   return arr;
};

var isValidId = exports.isValidId = function(str) {
   // FIXME make the regex more specific
   return /^([0-9]+)$/.test(str + "");
};