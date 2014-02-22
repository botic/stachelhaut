importPackage(com.google.appengine.api.users);

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

