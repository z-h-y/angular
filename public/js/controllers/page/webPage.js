(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('WebPageCtrl', WebPageCtrl);

  WebPageCtrl.$inject = ['$scope', '$state', 'Config', 'Actions', '$q', 'DTOptionsBuilder', 'DTColumnBuilder', '$filter', '$compile', 'Utils'];

  function WebPageCtrl($scope, $state, Config, Actions, $q, DTOptionsBuilder, DTColumnBuilder, $filter, $compile, Utils) {

    Config.getDtOptions(function(result) {
      $scope.dtOptions = result.withOption('searching', true)
                                .withOption('lengthChange', false)
                                .withOption('order', [1, 'desc'])
                                // .withOption('bSortable', false)
                                // .withOption('aTargets', ['nosort'])
                                .withOption('ajax', {
                                  url: '/admin/api/site/pageAnalysis/search?type=respondents&filter=' + JSON.stringify($scope.actualDate),
                                  type: 'GET',
                                  // dataSrc: function(json) {
                                  //   console.log(json);
                                  // }
                                  data: function(d, settings) {
                                    var index = d.order[0].column;
                                    d.key = d.search.value;
                                    d.order = d.columns[index].data + ',' + d.order[0].dir;
                                    delete d.columns;
                                    delete d.search;
                                  },
                                })
                                .withDataProp('data')
                                .withOption('processing', true)
                                .withOption('serverSide', true)
                                .withPaginationType('full_numbers')
                                .withOption('createdRow', function(row) {
                                  // Recompiling so we can bind Angular directive to the DT
                                  $compile(angular.element(row).contents())($scope);
                                });
    });

    $scope.dtColumns = [
      DTColumnBuilder.newColumn('title').withTitle('url').renderWith(function(data, type, full) {
        data = decodeURI(decodeURI(data));
        var result = $filter('limitTo')(data, 50);
        result = data.length <= 50 ? result : result + '...';
        return '<a class="ng-scope" href="http://' + data + '" target="_blank" title="' + data + '">' + result + '</a>&nbsp&nbsp&nbsp&nbsp<a href="#" title="走势图" ng-click="viewChart(\'' + data + '\')"><i class="fa fa-bar-chart-o"></i></a>'
      }),
      DTColumnBuilder.newColumn('pv').withTitle('浏览量PV'),
      DTColumnBuilder.newColumn('uv').withTitle('访客数UV'),
      DTColumnBuilder.newColumn('entryCount').withTitle('入口页次数'),
      DTColumnBuilder.newColumn('leaveCount').withTitle('退出页次数'),
      DTColumnBuilder.newColumn('bounceRate').withTitle('退出率'),
      DTColumnBuilder.newColumn('avgDuration').withTitle('平均停留时长(秒)'),
      // DTColumnBuilder.newColumn('avgPage').withTitle('平均访问页面')
    ];

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

    $scope.actualDateOpts = {
      locale: Config.datePickerLanguage,
      eventHandlers: {
        'apply.daterangepicker': _getData
      }
    }

    $scope.compareDateOpts = {
      locale: Config.datePickerLanguage,
      eventHandlers: {
        'apply.daterangepicker': _getData
      }
    }

    $scope.queryBtnClick = queryBtnClick;
    $scope.urlQuery = urlQuery;
    $scope.isComparedWatcher = isComparedWatcher;
    $scope.viewChart = viewChart;
    $scope.setRange = setRange;

    _init();

    function _init() {
      setRange('day');
    }

    function _getData() {
      $scope.actualDate.startDate = moment($scope.actualDate.startDate).format('YYYY-MM-DD'),
      $scope.actualDate.endDate = moment($scope.actualDate.endDate).format('YYYY-MM-DD');

      var diff = moment($scope.actualDate.endDate).diff(moment($scope.actualDate.startDate), 'days');

      if (diff > 30) {
        Utils.displayError('不能大于一个月');
        return;
      }

      if ($scope.isCompared) {
        $scope.compareDate.startDate = moment($scope.compareDate.startDate).format('YYYY-MM-DD'),
        $scope.compareDate.endDate = moment($scope.compareDate.endDate).format('YYYY-MM-DD');
        var diff2 = moment($scope.compareDate.endDate).diff(moment($scope.compareDate.startDate), 'days');
        if (diff !== diff2) {
          var timeDiff = diff - diff2;
          $scope.compareDate = {
            startDate: $scope.compareDate.startDate,
            endDate: moment($scope.compareDate.endDate).add(timeDiff, 'days').format('YYYY-MM-DD')
          }
        }
      }

      Actions.pageAnalysis('summary', $scope.actualDate)
        .then(function(data) {
          $scope.summaryList = [data.data.data];
          if ($scope.isCompared) {
            return Actions.pageAnalysis('summary', $scope.compareDate);
          } else {
            return false;
          }
        })
        .then(function(data) {
          if (data) {
            $scope.summaryList.push(data.data.data);
          }
        });

        if ($scope.dtOptions) {
          $scope.dtOptions.ajax.url = '/admin/api/site/pageAnalysis/search?type=respondents&filter=' + JSON.stringify($scope.actualDate);
        }

      // Actions.pageAnalysis('respondents', $scope.actualDate)
      //   .then(function(data) {
      //     $scope.respondentList = data.data.data;
      //   });

    }

    function queryBtnClick() {
      _getData();
    }

    function urlQuery(keyword) {
      Actions.pageAnalysis('respondents', $scope.actualDate, keyword)
        .then(function(data) {
          $scope.respondentList = data.data.data;
        });
    }

    function isComparedWatcher() {

      $scope.compareDate = {
        startDate: moment($scope.actualDate.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
        endDate: moment($scope.actualDate.endDate).subtract(1, 'days').format('YYYY-MM-DD')
      }

      _getData();

    }

    function viewChart(webside) {
      $state.go('app.page.viewChart', {'website': webside, 'date': JSON.stringify($scope.actualDate)});
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
