(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('CodecCtrl', CodecCtrl);

  CodecCtrl.$inject = ['$scope', 'DTColumnDefBuilder', 'Config', 'Codec', 'Restangular', '$window', 'Utils'];

  function CodecCtrl ($scope, DTColumnDefBuilder, Config, Codec, Restangular, $window, Utils) {

    $scope.dtOptions = Config.getDtOptions();
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(5).notSortable(),
      DTColumnDefBuilder.newColumnDef(6).notSortable()
    ];
    $scope.dtInstanceCb = Utils.buildDtInstanceCb($scope, _clearCodec);
    $scope.editCodec = editCodec;
    $scope.saveCodec = saveCodec;
    $scope.cancelEdit = cancelEdit;

    $scope.codec = {};
    $scope.codec.active = 1;
    var codecIndex = -1;

    _init();

    function _init() {
      Codec.getList().then(function(codec) {
        $scope.codecList = codec;
        _.forEach($scope.codecList, function(n) {
          _addActiveName(n);
        });
      });

      $scope.$watch('codec.active', function(newValue) {
        if (newValue === 0) {
          $scope.btnName = '启用';
          $scope.active = false;
        } else if (newValue === 1) {
          $scope.btnName = '关闭';
          $scope.active = true;
        }
      }, true);
    }

    function _addActiveName(obj) {
      if (obj.active === 0) {
        obj.activeName = '关闭';
      } else if (obj.active === 1) {
        obj.activeName = '启用';
      }
    }

    function _clearCodec() {
      $scope.codec = {};
      codecIndex = -1;
      $scope.codec.active = 1;
    }

    function cancelEdit() {
      _clearCodec();
    }

    function editCodec(index) {
      codecIndex = index;
      var codec = Restangular.copy($scope.codecList[codecIndex]);
      if (codec) {
        $scope.codec = codec;
      }
    }

    function saveCodec() {
      var codec = $scope.codec;
      _addActiveName(codec);
      if (codec && codec.group && codec.name) {
        codec.comment = codec.comment ? codec.comment : '';
        if (!codec.id) {
          Codec.post(codec).then(function(newCodec) {
            if (!newCodec.error) {
              _addActiveName(newCodec);
              $scope.codecList.push(newCodec);
            }
            _clearCodec();
          }, function() {
            _clearCodec();
          });
        } else {
          codec.save().then(function(data) {
            if (!data.error) {
              $scope.codecList.splice(codecIndex, 1, codec);
            }
            _clearCodec();
          }, function() {
            _clearCodec();
          });
        }
      } else {
        Utils.displayError('请填写的所有必填信息(注备注外)！');
      }
    }
  }

})();
