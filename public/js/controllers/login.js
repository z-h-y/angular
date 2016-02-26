(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$scope', '$rootScope', '$location', 'Session', 'Config'];

  function LoginCtrl ($scope, $rootScope, $location, Session, Config) {

    $scope.appTitle = Config.appTitle;
    $scope.login = login;

    function login() {
      var name = $scope.user.name;
      var pwd = $scope.user.password;
      var remember = $scope.user.remember;

      var user = $rootScope.globals.user;
      var data = {'name': name, 'password': pwd};
      if (!!remember) {
        data.remember = 1;
      }
      Session.post(data)
      .then(function(session) {
        if (session.name) {
          user.name = session.name;
          user.id = session.id;
          user.login = true;
          user.unavailable = false;
          $rootScope.$emit('setup-menu', {isRefresh: false});
          $location.url('/dashboard');
        } else {
          user.name = '';
          user.id = '';
          user.login = false;
        }
      });
    }
  }

})();
