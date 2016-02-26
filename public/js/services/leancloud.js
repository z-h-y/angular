(function() {
  'use strict';

  var app = angular.module('adminApp');

  // 本service使用了LeanCloud的Rest API，请前往 https://leancloud.cn/docs/ 查看相关文档
  app.factory('LeanCloud', ['Restangular', '$http', function(Restangular, $http) {

    var url = '',
      appId = '',
      reqSign = '';

    function getHeaders() {
      return {
        'X-AVOSCloud-Application-Id': appId,
        'X-AVOSCloud-Request-Sign': reqSign,
        'Content-Type': 'application/json'
      };
    }

    function callCloudFn(functionName, data, cb, method) {
      var req = {
        method: method || 'POST',
        url: url + '/functions/' + functionName,
        headers: getHeaders(),
        data: data
      };

      $http(req).then(function(res) {
        var result;
        if (res && res.data.result) {
          result = res.data.result;
        }
        if (cb) {
          cb(result);
        }
      }, function(error) {
        if (cb) {
          cb(error);
        }
      });
    }

    return {
      init: function(cb) {
        $http.get('/admin/api/getLeanCloudConfig?time=' + Date.now()).success(function(result) {
          if (result && result.data) {
            var data = result.data;
            url = data.leanCloudAppUrl || url;
            appId = data.leanCloudAppId || appId;
            reqSign = data.leanCloudReqSign || reqSign;
            cb(getHeaders());
          }
        });
      },

      resources: {
        /********* Add your leancloud's resources *************/


        /********* Add your leancloud's resources *************/
      },

      actions: {
        /********* Add your leancloud's actions *************/


        /********* Add your leancloud's actions *************/
      }
    };

  }]);

})();
