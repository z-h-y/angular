(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('RoleCtrl', RoleCtrl);

  RoleCtrl.$inject = ['$rootScope', '$scope', 'DTColumnDefBuilder', 'Config', 'Restangular', 'Role', 'Permission', 'Utils', 'Codec'];

  function RoleCtrl ($rootScope, $scope, DTColumnDefBuilder, Config, Restangular, Role, Permission, Utils, Codec) {

    $scope.dtOptions = Config.getDtOptions();
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];
    $scope.dtInstanceCb = Utils.buildDtInstanceCb($scope, _clearRole);
    $scope.cancelEdit = cancelEdit;
    $scope.editRole = editRole;
    $scope.saveRole = saveRole;
    $scope.setRolePermission = setRolePermission;
    $scope.saveRolePermission = saveRolePermission;
    $scope.changeStatus = changeStatus;
    $scope.editDisabled = editDisabled;

    _init();

    var roleIndex = -1;
    var roleId = -1;
    var idCheck = [];
    $scope.selectedAll = {};
    $scope.selectedAll.status = [];

    function _init() {
      Role.getList().then(function(roleList) {
        if ($rootScope.globals.user.name !== 'owner') {
          if (_.find(roleList, {'name': 'owner'})) {
            _.remove(roleList, {'name' : 'owner'});
          }
        }
        $scope.roleList = roleList;
      });
      Permission.getList().then(function(permissionList) {
        $scope.permissionList = permissionList;
        $scope.permissionCategories = _getPermissionCategories(permissionList);
      });
      Codec.getList().then(function(data) {
        $scope.permissionType = _.filter(data, 'group', 'permissionType');
      });
    }

    function _getPermissionCategory(permissionName) {
      var regex = /^([^-]+)(-?)/;
      var match = regex.exec(permissionName);
      if (match && match[1]) {
        return match[1];
      }
    }

    function _getPermissionCategories(permissionList) {
      var categorieNames = [];
      var index = 0;
      _.each(permissionList, function(permission) {
        var name = _getPermissionCategory(permission.displayName);
        if (!_.includes(categorieNames, name)) {
          categorieNames.push(name);
        }
        $scope.permissionList[index]._categorieName = name;
        index++;
      });
      return categorieNames;
    }

    function _clearRole() {
      $scope.role = {};
      roleIndex = -1;
    }

    function changeStatus(index) {
      var _categorieName = $scope.permissionCategories[index];
      var uiStatus = $scope.selectedAll.status[index];

      if (uiStatus === true) {
        _.forEach(_.filter($scope.permissionList, {'_categorieName': _categorieName, 'status': false}), function(n) {
          n.status = true;
        });
      }

      if (uiStatus === false) {
        _.forEach(_.filter($scope.permissionList, {'_categorieName': _categorieName, 'status': true}), function(n) {
          n.status = false;
        });
      }

    }

    function cancelEdit() {
      _clearRole();
    }

    function editRole(index) {
      roleIndex = index;
      var role = Restangular.copy($scope.roleList[roleIndex]);
      if (role) {
        $scope.role = role;
      }
    }

    function saveRole() {
      var role = $scope.role;

      if (role && role.name) {
        if (!role.id) {
          Role.post(role).then(function(newRole) {
            if (!newRole.error) {
              $scope.roleList.push(newRole);
            }
            _clearRole();
          }, function() {
            _clearRole();
          });
        } else {
          role.save().then(function(data) {
            if (!data.error) {
              $scope.roleList.splice(roleIndex, 1, role);
            }
            _clearRole();
          }, function() {
            _clearRole();
          });
        }
      }
    }

    function setRolePermission(index) {
      idCheck = [];
      roleId = $scope.roleList[index].id;
      roleIndex = index;

      Role.one(roleId).getList('permissions').then(function(rolePermissionList) {
          var permissionList = $scope.permissionList;
          if (rolePermissionList) {
            for (var i=0; i<permissionList.length; i++) {
              $scope.permissionList[i].status = false;
              for ( var j=0; j<rolePermissionList.length; j++) {
                if (permissionList[i].id === rolePermissionList[j].id) {
                  $scope.permissionList[i].status = true;
                  idCheck.push(rolePermissionList[j].id);
                }
              }
            }
          }

        $scope.selectedAll.status = [];
        var status = false;
        _.forEach($scope.permissionCategories, function(n, key) {
          $scope.selectedAll.status[key] = false;
          var categorieList_one = _.filter($scope.permissionList, {'_categorieName': n});
          var categorieList_two = _.filter($scope.permissionList, {'_categorieName': n, 'status': status});
          if (categorieList_two.length === 0) {
            $scope.selectedAll.status[key] = !status;
          }
          if (categorieList_one.length === categorieList_two.length) {
            $scope.selectedAll.status[key] = status;
          }
        });
      });
    }

    function saveRolePermission() {
      var rolePermissionIds = [];
      for (var i=0; i<$scope.permissionList.length; i++) {
        if ($scope.permissionList[i].status) {
          rolePermissionIds.push($scope.permissionList[i].id);
        }
      }
      var ids = rolePermissionIds.sort().toString(),
          sIdCheck = idCheck.sort().toString();

      if (ids !== sIdCheck) {
        Role.one(roleId).customPUT('', 'permissions', {ids: ids}).then(function(data) {
          if (data.error) {
            console.warn(data.error);
          }

          if (!data.error && $rootScope.globals.user.name === $scope.roleList[roleIndex].name) {
            $rootScope.$emit('setup-menu', {isRefresh: false, isUpload: false});
          }

        });
      }
      $('#myModal').modal('hide');
    }

    function editDisabled(index) {
      var result = false;
      var role = $scope.roleList[index];
      if (role && role.name === 'admin' && $rootScope.globals.user.name !== 'owner') {
        result = true;
      }
      return result;
    }
  }
})();
