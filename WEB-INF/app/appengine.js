importPackage(com.google.appengine.api.users);

var log = require("ringo/logging").getLogger(module.id);

var getCredentials = exports.getCredentials = function(req) {
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
      logoutURI: userService.createLogoutURL(requestURI),
      loginURI: userService.createLoginURL(requestURI)
   };
};

var mapProperties = exports.mapProperties = function(entity) {
   var parentKey = entity.getParent();
   var map = entity.getProperties();
   var obj = {
      id: entity.getKey().getId(),
      parentId: (parentKey !== null ? parentKey.getId() : null)
   };

   map.keySet().toArray().forEach(function(key) {
      if (map.get(key) instanceof java.util.Date) {
         obj[key] = new Date(map.get(key).getTime());
      } else {
         obj[key] = map.get(key);
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