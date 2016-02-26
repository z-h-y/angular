(function() {
  'use strict';

  angular
    .module('adminApp')
    .factory('Actions', Actions);

  Actions.$inject = ['$http', 'Utils'];

  function Actions($http, Utils) {

    return {
      updateUserProfile: function(data, cb) {
        if (!data || !cb) {
          return;
        }
        $http.post('/admin/api/updateUserProfile', data).then(function(response) {
          if (response && response.data) {
            var result = response.data;
            if (result && result.error) {
              cb(result.error);
            } else {
              cb();
            }
          }
        }, function(response) {
          if (cb) {
            cb(response.data);
          }
        });
      },

      /********* Add your app's actions *************/
      trendAnalysis: function(type, date, timeUnit, items) {
        var sDate = JSON.stringify(date);
        var requestUrl;
        switch (type) {
          case 'summary':
            requestUrl = $http.get('/admin/api/site/trendAnalysis/search?type=' + type + '&filter=' + sDate);
          break;
          case 'chart':
            requestUrl = $http.get('/admin/api/site/trendAnalysis/search?type=' + type + '&filter=' + sDate + '&timeUnit=' + timeUnit + '&items=' + JSON.stringify(items));
          break;
          case 'article':
            requestUrl = $http.get('/admin/api/site/trendAnalysis/search?type=' + type + '&filter=' + sDate);
          break;
        }

        var siteData = requestUrl.
          success(function(data) {
            return data;
          })
        return siteData;
      },

      pageAnalysis: function(type, date, key, timeUnit, items) {
        var sDate = JSON.stringify(date),
            requestUrl;
        switch (type) {
          case 'summary':
            requestUrl = $http.get('/admin/api/site/pageAnalysis/search?type=' + type + '&filter=' + sDate);
          break;
          case 'respondents':
            if (key) {
              requestUrl = $http.get('/admin/api/site/pageAnalysis/search?type=' + type + '&filter=' + sDate + '&key=' + key);
            } else {
              requestUrl = $http.get('/admin/api/site/pageAnalysis/search?type=' + type + '&filter=' + sDate);
            }
          break;
          case 'chart':
            requestUrl = $http.get('/admin/api/site/pageAnalysis/search?type=' + type + '&filter=' + sDate + '&key=' + key + '&timeUnit=' + timeUnit + '&items=' + JSON.stringify(items));
          break;
          case 'pageSummary':
            requestUrl = $http.get('/admin/api/site/pageAnalysis/search?type=' + type + '&filter=' + sDate + '&key=' + key);
          break;
        }

        var siteData = requestUrl.
          success(function(data) {
            return data;
          })
        return siteData;
      },

      sourceAnalysis: function(type, date, timeUnit, items) {
        var sDate = JSON.stringify(date);
        var requestUrl;
        switch (type) {
          case 'summary':
            requestUrl = $http.get('/data.php?type=' + type + '&filter=' + sDate);
          break;
          case 'chart':
            requestUrl = $http.get('/data.php?type=' + type + '&filter=' + sDate + '&timeUnit=' + timeUnit + '&items=' + JSON.stringify(items));
          break;
          case 'article':
            requestUrl = $http.get('/data.php?type=' + type + '&filter=' + sDate);
          break;
        }

        var siteData = requestUrl.
          success(function(data) {
            return data;
          })
        return siteData;
      }
      /********* Add your app's actions *************/
    };

  }

})();
