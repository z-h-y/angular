(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$rootScope', '$scope', 'DTColumnDefBuilder', 'Config', 'Restangular', 'User', 'Role', 'Utils'];

  function UserCtrl ($rootScope, $scope, DTColumnDefBuilder, Config, Restangular, User, Role, Utils) {

    Config.getDtOptions(function(result) {
      $scope.dtOptions =  result.withOption('scrollX', true);
    });
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(3).notSortable(),
      DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];
    $scope.dtInstanceCb = Utils.buildDtInstanceCb($scope, _clearUser);
    $scope.cancelEdit = cancelEdit;
    $scope.editUser = editUser;
    $scope.saveUser = saveUser;
    $scope.setUserRole = setUserRole;
    $scope.saveUserRole = saveUserRole;
    $scope.editDisabled = editDisabled;

    var userIndex = -1;
    var userId = -1;
    var idCheck = [];
    $scope.user = {};
    $scope.user.active = 1;

    _init();

    function _init() {
      User.getList({includeRoles : true}).then(function(userList) {
        if ($rootScope.globals.user.name !== 'owner') {
          if (_.find(userList, {'name': 'owner'})) {
            _.remove(userList, {'name' : 'owner'});
          }
        }
        $scope.userList = userList;
        _.forEach($scope.userList, function(n) {
          _addActiveName(n);
        });
      });

      Role.getList().then(function(roleList) {
        if ($rootScope.globals.user.name !== 'owner') {
          if (_.find(roleList, {'name': 'owner'})) {
            _.remove(roleList, {'name' : 'owner'});
          }
        }
        $scope.roleList = roleList;
      });

      $scope.$watch('user.active', function(newValue) {
        if (newValue === 0) {
          $scope.btnName = '停用';
          $scope.active = false;
        } else if (newValue === 1) {
          $scope.btnName = '启用';
          $scope.active = true;
        }
      }, true);
    }

    function _clearUser() {
      $scope.user = {};
      userIndex = -1;
      $scope.user.active = 1;
    }

    function _addActiveName(obj) {
      if (obj.active === 0) {
        obj.activeName = '停用';
      } else if (obj.active === 1) {
        obj.activeName = '启用';
      }
    }

    function cancelEdit() {
      _clearUser();
    }

    function editUser(index) {
      userIndex = index;
      var user = Restangular.copy($scope.userList[userIndex]);
      if (user) {
        $scope.user = user;
      }
    }

    function saveUser() {
      var user = $scope.user;
      _addActiveName(user);
      if (user && user.name && user.email) {
        if (user.displayPassword) {
            var result = Utils.isComplexPassword(user.displayPassword);
            if (result) {
              user.password = user.displayPassword;
              user.password_confirmation = user.displayPassword;
            } else {
              Utils.displayError('密码必须由8位以上的数字和字母组成！');
              return;
            }
        } else {
          user.password_confirmation = user.password;
        }
        if (!user.id && user.displayPassword) {
          User.post(user).then(function(newUser) {
            if (!newUser.error) {
              _addActiveName(newUser);
              $scope.userList.push(newUser);
            }
            _clearUser();
          }, function() {
            _clearUser();
          });
        } else if (user.id) {
          user.save().then(function(data) {
            if (!data.error) {
              $scope.userList.splice(userIndex, 1, user);
            }
            _clearUser();
          }, function() {
            _clearUser();
          });
        }

      }
    }

    function setUserRole(index) {
      userIndex = index;
      $scope.roleType = 0;
      idCheck = [];
      userId = $scope.userList[index].id;
      User.one(userId).getList('roles').then(function(userRoleList) {
        if (userRoleList.length) {
          $scope.roleType = userRoleList[0].id;
        }
      });
    }

    function saveUserRole() {
      if ($scope.roleType) {
        User.one(userId).customPUT('', 'roles', {ids: $scope.roleType}).then(function(data){
          if(data.error){
            console.warn(data.error.message);
          } else {
            $scope.userList[userIndex].roles = [];
            $scope.userList[userIndex].roles[0] = _.find($scope.roleList, {'id': parseInt($scope.roleType)});
          }
        });
      } else {
        Utils.displayError('请选择角色！');
      }
      $('#myModal').modal('hide');
    }

    function editDisabled(index) {
      var result = false;
      var user = $scope.userList[index];
      if (user && user.name === 'admin' && $rootScope.globals.user.name !== 'owner') {
        result = true;
      }
      return result;
    }
  }
})();
