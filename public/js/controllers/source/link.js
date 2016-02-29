(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('SourceLinkCtrl', SourceLinkCtrl);

  SourceLinkCtrl.$inject = ['$scope', 'Config', '$state', 'Actions', '$q'];

  function SourceLinkCtrl($scope, Config, $state, Actions, $q) {

    Config.getDtOptions(function(result) {
      $scope.dtOptions = result.withOption('searching', false)
                                .withOption('lengthChange', false)
                                .withOption('order', []);
    });
    $scope.localLang = Config.multiSelectWithLanguage;

    $scope.timeSign = { //时间标识
      _1day: true,
      _7days: false,
      _30days: false
    }

    $scope.actualDate = {
      startDate: '',
      endDate: ''
    }
    $scope.compareDate = {
      startDate: '',
      endDate: ''
    }
    $scope.isCompared = false; //是否要进行对比

    $scope.summaryList = [];

    $scope.articleList = [];
    //固定时间段
    $scope.setRange = setRange;
    //时间段对比checkbox监听器
    $scope.isComparedWatcher = isComparedWatcher;

    $scope.actualDateOpts = {
      locale: Config.datePickerLanguage,
      eventHandlers: {
        'apply.daterangepicker': _getData
      }
    }

    $scope.compareDateOpts = {
      locale: Config.datePickerLanguage,
      // ranges: {
      //   '对比单日': [moment().subtract(2, 'days'), moment().subtract(2, 'days')],
      //   '对比七天': [moment().subtract(8, 'days'), moment().subtract(2, 'days')],
      // },
      eventHandlers: {
        'apply.daterangepicker': _getData
      }
    }

    _init();

    function _init() {

      setRange('day');

    }

    function _getData() {

      var aStartDate = moment($scope.actualDate.startDate).format('YYYY-MM-DD'),
          aEndDate = moment($scope.actualDate.endDate).format('YYYY-MM-DD');

      var ids = _.map($scope.indicatorsOutput, 'id');

      var diff = moment(aEndDate).diff(moment(aStartDate), 'days');

      if ($scope.isCompared) {
        var cStartDate = moment($scope.compareDate.startDate).format('YYYY-MM-DD'),
            cEndDate = moment($scope.compareDate.endDate).format('YYYY-MM-DD');
        var diff2 = moment(cEndDate).diff(moment(cStartDate), 'days');
        if (diff !== diff2) {
          var timeDiff = diff - diff2;
          // $scope.compareDate.endDate = cEndDate = moment(cEndDate).add(timeDiff, 'days').format('YYYY-MM-DD');
          $scope.compareDate = {
            startDate: cStartDate,
            endDate: moment(cEndDate).add(timeDiff, 'days').format('YYYY-MM-DD')
          }
        }

      }

      Actions.sourceAnalysis('summary', {'startDate': aStartDate, 'endDate': aEndDate })
        .then(function(data) {
          $scope.summaryList = data.data.data;
          if ($scope.isCompared) {
            return Actions.sourceAnalysis('summary', $scope.compareDate);
          } else {
            return false;
          }
        })
        .then(function(data) {
          if (data) {
            $scope.summaryList.push(data.data.data[0]);
          }
        });

      Actions.sourceAnalysis('article', {'startDate': aStartDate, 'endDate': aEndDate })
        .then(function(data) {
          $scope.articleList = data.data.data;
          if ($scope.isCompared) {
            return Actions.sourceAnalysis('article', $scope.compareDate);
          } else {
            return false;
          }
        })
        .then(function(data) {
          if (data) {
            _.forEach($scope.articleList, function(n, key) {
              n.compareData = data.data.data[key];
            });          
          }
        });
    }

    function isComparedWatcher() {

      $scope.compareDate = {
        startDate: moment($scope.actualDate.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
        endDate: moment($scope.actualDate.endDate).subtract(1, 'days').format('YYYY-MM-DD')
      }

      _getData();
    }

    function setRange(dateType) {
      switch (dateType) {
        case 'day':
          $scope.actualDate = {
            startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          }
          $scope.timeSign = {
            _1day : true,
            _7days : false,
            _30days : false
          };
        break;

        case 'week':
          $scope.actualDate = {
            startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          }
          $scope.timeSign = {
            _1day : false,
            _7days : true,
            _30days : false
          };
        break;

        case 'month':
          $scope.actualDate = {
            startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          }
          $scope.timeSign = {
            _1day : false,
            _7days : false,
            _30days : true
          };
        break;
      }

      _getData();
    }

  }

})();
