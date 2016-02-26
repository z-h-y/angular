(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('GeneralCtrl', GeneralCtrl);

  GeneralCtrl.$inject = ['$scope', 'Actions', '$q'];

  function GeneralCtrl($scope, Actions, $q) {

    $scope.summaryList = [];

    _getAllSummary();

    function _getAllSummary() {
      var oneDay = {
            startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          },
          sevenDays = {
            startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          },
          thirdDays = {
            startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          };
      var arr = [];
      arr[0] = Actions.trendAnalysis('summary', oneDay);
      arr[1] = Actions.trendAnalysis('summary', sevenDays);
      arr[2] = Actions.trendAnalysis('summary', thirdDays);
      var promises = $q.all(arr);
      promises.then(function(data) {
        _.forEach(data, function(n, key) {
          switch (key) {
            case 0:
              n.data.data.days = '昨天';
            break;
            case 1:
              n.data.data.days = '近7天';
            break;
            case 2:
              n.data.data.days = '近30天';
            break;
          }
          $scope.summaryList.push(n.data.data);
        });
      });
    }

  }

})();
