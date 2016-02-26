(function() {
  'use strict';

  angular.module('adminApp')

  /** admin */
  .factory('User', ['Restangular', function(Restangular) {

    return Restangular.service('admin/users');

  }])
  .factory('Role', ['Restangular', function(Restangular) {

    return Restangular.service('admin/roles');

  }])
  .factory('Permission', ['Restangular', function(Restangular) {

    return Restangular.service('admin/permissions');

  }])
  .factory('Codec', ['Restangular', function(Restangular) {

    return Restangular.service('admin/codecs');

  }])
  /** session */
  .factory('Session', ['Restangular', function(Restangular) {

    return Restangular.service('sessions');

  }]);

})();
