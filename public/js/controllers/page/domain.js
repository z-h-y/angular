(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('DomainCtrl', DomainCtrl);

  DomainCtrl.$inject = ['$scope', 'Config'];

  function DomainCtrl($scope, Config) {

    Config.getDtOptions(function(result) {
      $scope.dtOptions = result.withOption('searching', false)
                                .withOption('lengthChange', false)
                                .withOption('order', []);
    });

    $scope.timeSign = { //时间标识
      _1day: true,
      _7days: false,
      _30days: false
    }

    $scope.actualDate = {
      startTime: '',
      endTime: ''
    }
    $scope.compareDate = {
      startTime: '',
      endTime: ''
    }
    $scope.isCompared = false; //是否要进行对比

    $scope.summaryList = [
      {
        'displayDate': 20150322,
        'pv': 57000,
        'uv': 38000,
        'nv': 5000,
        'ip': 37500,
        'jp': '15%',
        'st': 20,
        'pn': 24
      },
      {
        'displayDate': 20150323,
        'pv': 65000,
        'uv': 39000,
        'nv': 3500,
        'ip': 40000,
        'jp': '17%',
        'st': 25,
        'pn': 25
      },
    ]

    // $scope.items = [
    //   [['www.appgame.com']],
    //   [['20150322', 25600, 16300, 2000, 6500, '15%', '00:12:02', 24]],
    //   [['2015/12/16', 25611, 16311, 2111, 6511, '16%', '00:11:12', 26]]
    // ];

    $scope.items = [
      [['www.appgame.com'], ['bbs.appgame.com']],
      [['20150322', 25600, 16300, 2000, 6500, '15%', '00:12:02', 24], ['20150322', 15500, 8250, 1000, 4500, '15%', '00:10:02', 24]],
      [['20151216', 25611, 16311, 2111, 6511, '16%', '00:11:12', 26], ['20151216', 15511, 8251, 1111, 4511, '15%', '00:11:02', 24]]
    ];

    $scope.actualDate = {
      locale: Config.datePickerLanguage
    }

    // $scope.compareDateOpts = {
    //   locale: Config.datePickerLanguage,
    //   eventHandlers: {
    //     'apply.daterangepicker': _daterangepickerClick
    //   }
    // }

    $scope.queryBtnClick = queryBtnClick;
    $scope.isComparedWatcher = isComparedWatcher;
    $scope.setRange = setRange;

    _init();

    function _init() {
      setRange('day');
    }

    function _getData() {
      var aStartTime = moment($scope.actualDate.startTime).format('YYYY-MM-DD'),
          aEndTime = moment($scope.actualDate.endTime).format('YYYY-MM-DD');

      var diff = moment(aEndTime).diff(moment(aStartTime), 'days');

      if ($scope.isCompared) {
        var cStartTime = moment($scope.compareDate.startTime).format('YYYY-MM-DD'),
            cEndTime = moment($scope.compareDate.endTime).format('YYYY-MM-DD');
        var diff2 = moment(cEndTime).diff(moment(cStartTime), 'days');
        if (diff !== diff2) {
          var timeDiff = diff - diff2;
          $scope.compareDate.endTime = cEndTime = moment(cEndTime).add(timeDiff, 'days').format('YYYY-MM-DD');
        }
      }

      console.log(aStartTime);
      console.log(aEndTime);
      console.log(cStartTime);
      console.log(cEndTime);

    }

    function queryBtnClick() {
      _getData();
    }

    function isComparedWatcher() {
      $scope.compareDate.startTime = moment($scope.actualDate.startTime).subtract(1, 'days').format('YYYY-MM-DD');
      $scope.compareDate.endTime = moment($scope.actualDate.endTime).subtract(1, 'days').format('YYYY-MM-DD');
    }

    function setRange(dateType) {
      switch (dateType) {
        case 'day':
          $scope.actualDate = {
            startDate: moment().subtract(1, 'days'),
            endDate: moment().subtract(1, 'days')
          }
          $scope.timeSign = {
            _1day : true,
            _7days : false,
            _30days : false
          };
        break;

        case 'week':
          $scope.actualDate = {
            startDate: moment().subtract(7, 'days'),
            endDate: moment().subtract(1, 'days')
          }
          $scope.timeSign = {
            _1day : false,
            _7days : true,
            _30days : false
          };
        break;

        case 'month':
          $scope.actualDate = {
            startDate: moment().subtract(30, 'days'),
            endDate: moment().subtract(1, 'days')
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
