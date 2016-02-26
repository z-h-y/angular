(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$rootScope', '$location', '$timeout', 'Utils', 'Session', 'User', 'Config', '$log', '$window', 'Actions'];

  function MainCtrl ($scope, $rootScope, $location, $timeout, Utils, Session, User, Config, $log, $window, Actions) {

    $scope.appTitle = Config.appTitle;
    $window.document.title = Config.appTitle;
    $scope.logout = logout;
    $scope.loginPageClass = loginPageClass;

    $scope.passwordModel = {
      'oldPassword': '',
      'newPassword': '',
      'newPasswordRepeat': ''
    };
    $scope.preparePassword = preparePassword;
    $scope.updatePassword = updatePassword;
    $scope.canUpdatePassword = canUpdatePassword;

    function canUpdatePassword() {
      var result = true;
      var model = $scope.passwordModel;
      _.each(model, function(item) {
        if (!item) {
          result = false;
          return false;
        }
      });
      if (model.newPassword && model.newPassword.length < 8) {
        result = false;
      } else if (!Utils.isComplexPassword(model.newPassword)) {
        result = false;
      } else if (model.newPassword !== model.newPasswordRepeat) {
        result = false;
      }
      return result;
    }

    function preparePassword() {
      $scope.passwordModel = {
        'oldPassword': '',
        'newPassword': '',
        'newPasswordRepeat': ''
      };
    }

    function updatePassword() {
      Actions.updateUserProfile($scope.passwordModel, function(err) {
        $('#passwordModal').modal('hide');
        if (err) {
          Utils.displayError(err);
        } else {
          logout();
        }
      });
    }

    function loginPageClass() {
      var path = $location.path();
      return {
        'before-login': (path === '/login')
      };
    }

    function logout() {
      var user = $rootScope.globals.user;
      Session.one(1).remove().then(function() {
        user.login = false;
        user.unavailable = true;
        user.roles = '';
        user.permissions = '';
        $location.url('/login');
        _setVisible(Config.menuList);
      });
    }

    /****** Menu process start ******/
    var allMenu = Config.menuList;
    var initMenuPath = 'dashboard';

    function _setVisible(menuList) {
      _.forEach(menuList, function(n) {
        n.visible = false;
        if (_.has(n, 'children')) {
          _setVisible(n.children);
        }
      });
    }

    function _setupRolePermission(user, cb) {
      var userId = user.id;
      if (userId && cb) {
        User.one(userId).getList('roles').then(function(roles) {
          user.roles = roles;
          return User.one(userId).getList('permissions');
        }).then(function(permissions) {
          user.permissions = permissions;
          cb(permissions);
        });
      }
    }

  function _setupMenu(permissions) {
    // menu permission format => menu:admin-user
    var menuNames = [];
    _.each(permissions, function(per) {
      var name = per.name;
      // var index = name.indexOf('menu:');
      // if (index >= 0) {
        // menuNames.push(name.split(':')[1]);
      // }
      menuNames.push(name);
    });

    _setVisible(allMenu);

    _.each(menuNames, function(menuName) {
      var menuArr = menuName.split('-');
      var currentItem = null, currentArray = allMenu;
      _.each(menuArr, function(menu) {
        if (currentArray) {
          currentItem = _.find(currentArray, { 'name': menu });
          if (currentItem) {
            currentItem.visible = true;
          }
          if (currentItem && currentItem.children) {
            currentArray = currentItem.children;
          } else {
            currentArray = null;
          }
        }
      });
    });

    $scope.menuList = allMenu;

    $timeout(function() {
      if (!$rootScope.globals.isUpload) {
        Utils.initSidebar();
      }
      $timeout(function() {
        $scope.menuResolved = true;
        if ($rootScope.globals.isRefresh) {
          _initMenuSelection();
        }
      }, 300);
    }, 500);

    _setupUserDesc();
    }

    function _setupUserDesc() {
      var user = $rootScope.globals.user;
      var desc = user.name;
      var names;
      if (user.roles) {
        names = _.pluck(user.roles, 'displayName');
        desc += ' (';
        desc += names.join(', ');
        desc += ')';
      }
      $scope.userDesc = desc;
    }

    function _initMenuSelection() {
      $('li.side-menu').find('a.active').click();
    }

    // 监听菜单初始化事件
    $rootScope.$on('setup-menu', function(event, data) {

      $rootScope.globals.isRefresh = !!data.isRefresh;
      $rootScope.globals.isUpload = !!data.isUpload;

      Config.prepareDynamicMenu();

      if (data && data.path) {
        var index = data.path.indexOf('/');
        initMenuPath = data.path.substring(index+1);
      }
      var user = $rootScope.globals.user;

      _setupRolePermission(user, _setupMenu);

    });
    /****** Menu process end ******/
  }

})();
