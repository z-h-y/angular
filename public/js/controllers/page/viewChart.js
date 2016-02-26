(function() {

  'use strict';

  angular
    .module('adminApp')
    .controller('ViewChartCtrl', ViewChartCtrl);

  ViewChartCtrl.$inject = ['$scope', 'Config', '$state', '$window', 'Actions', '$q', 'Utils'];

  function ViewChartCtrl($scope, Config, $state, $window, Actions, $q, Utils) {

    $scope.localLang = Config.multiSelectWithLanguage;
    $scope.indicatorsInput = [
      {
        id: 1,
        value: 'pv',
        name: '浏览量(PV)',
      },
      {
        id: 2,
        value: 'uv',
        name: '访问客数(UV)'
      },
      {
        id: 3,
        value: 'nv',
        name: '新访问客数'
      },
      {
        id: 4,
        value: 'ip',
        name: 'IP数'
      },
      {
        id: 5,
        value: 'bounceRate',
        name: '跳出率'
      },
      {
        id: 6,
        value: 'avgDuration',
        name: '平均访问时长'
      },
      // {
      //   id: 7,
      //   value: 'avgPage',
      //   name: '平均访问页面'
      // }
    ];

    $scope.timeSign = { //时间标识
      _1day: true,
      _7days: false,
      _30days: false
    }
    $scope.timeRule = {
      hour: false,
      day: true,
      week: false,
      month: false
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

    $scope.targetUrl = decodeURIComponent($state.params.website);

    $scope.chartConfig = {
      options: {
        chart: {
          type: 'line',
        },
        colors: ['#7cb5ec', '#f7c227', '#ED561B', '#91a9cf'],
        tooltip: {
          shared: true,
          crosshairs: true,
          borderWidth: 1
        },
        plotOptions: {
          series: {
            marker: {
              lineWidth: 1
            }
          }
        },
        legend: {
          align: 'right',
          verticalAlign: 'top',
          itemStyle: {
            fontSize: '13px'
          }
        },
      },
      series: [],
      title: {
        text: ''
      },
      useHighStocks: false,
      size: {
        height: 400
      },
      xAxis: {
        categories: [],
        title: {text: '/天', align: 'high'},
        gridLineWidth: 1,
        tickInterval: 1,
        tickmarkPlacement: "on",
        startOnTick: true,
        endOnTick: true,
        minPadding: 0,
        maxPadding: 0,
        offset: 0
      }
    };

    $scope.indicatorsOutput = [];
    $scope.summaryList = [];

    $scope.actualDate = {
      locale: Config.datePickerLanguage
    }

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

    $scope.funcClick = funcClick;
    $scope.queryBtnClick = queryBtnClick;
    $scope.isComparedWatcher = isComparedWatcher;
    $scope.setRange = setRange;
    $scope.setTimeRule = setTimeRule;

    _init();

    function _init() {
      var date = JSON.parse($state.params.date);
      $scope.actualDate = {
        startDate: date.startDate,
        endDate: date.endDate
      }

      $scope.indicatorsInput[0].ticked = true;
      $scope.indicatorsInput[1].ticked = true;
      $scope.indicatorsOutput = [$scope.indicatorsInput[0], $scope.indicatorsInput[1]];

      _getData();
    }

    function _getData() {
      var aStartTime = moment($scope.actualDate.startTime).format('YYYY-MM-DD'),
          aEndTime = moment($scope.actualDate.endTime).format('YYYY-MM-DD');

      var diff = moment(aEndTime).diff(moment(aStartTime), 'days');

      if (diff > 30) {
        Utils.displayError('不能大于一个月');
        return;
      }

      if ($scope.isCompared) {
        var cStartTime = moment($scope.compareDate.startTime).format('YYYY-MM-DD'),
            cEndTime = moment($scope.compareDate.endTime).format('YYYY-MM-DD');
        var diff2 = moment(cEndTime).diff(moment(cStartTime), 'days');
        if (diff !== diff2) {
          var timeDiff = diff - diff2;
          $scope.compareDate.endTime = cEndTime = moment(cEndTime).add(timeDiff, 'days').format('YYYY-MM-DD');
        }
      }

      Actions.pageAnalysis('pageSummary', $scope.actualDate, $scope.targetUrl)
        .then(function(data) {
          $scope.summaryList = [data.data.data];
          if ($scope.isCompared) {
            return Actions.pageAnalysis('pageSummary', $scope.compareDate, $scope.targetUrl);
          } else {
            return false;
          }
        })
        .then(function(data) {
          if (data) {
            $scope.summaryList.push(data.data.data);
          }
        });

      _printChart();

    }

    function _printChart() {

      $scope.actualDate = {
        startDate: moment($scope.actualDate.startDate).format('YYYY-MM-DD'),
        endDate: moment($scope.actualDate.endDate).format('YYYY-MM-DD')
      };

      if ($scope.isCompared) {
        $scope.compareDate = {
          startDate: moment($scope.compareDate.startDate).format('YYYY-MM-DD'),
          endDate: moment($scope.compareDate.endDate).format('YYYY-MM-DD')
        };
      }

      var items = _.map($scope.indicatorsOutput, 'value');
      var timeRule = _.findKey($scope.timeRule, function(o) {
        return o === true;
      });

      var arr = [];

      $scope.chartConfig.series = [];
      arr.push(Actions.pageAnalysis('chart', $scope.actualDate, $scope.targetUrl, timeRule, items));
      if ($scope.isCompared) {
        arr.push(Actions.pageAnalysis('chart', $scope.compareDate, $scope.targetUrl, timeRule, items))
      }
      var chartPromise = $q.all(arr);

      if (items.length === 2) {
        $scope.chartConfig.options.yAxis = [
          { // left y axis
            title: {
              text: null
            },
            allowDecimals: false,
            startOnTick: false,
            min: 0,
          },
          { // right y axis
            title: {
              text: null
            },
            gridLineWidth: 0,
            min: 0,
            opposite: true
          }
        ];
      }

      chartPromise.then(function(data) {
        var date = _.map(data[0].data.data, 'date');
        $scope.chartConfig.xAxis.categories = date;
        _.forEach(items, function(n, key) {
          var indicator = _.find($scope.indicatorsOutput, 'value', n),
              dataList = _.map(data[0].data.data, n);
          $scope.chartConfig.series[key] = {id: key+1, data: dataList, name: indicator.name, visible: true, yAxis: key};
        });

        if (data.length === 2) {
          var dataList2 = _.map(data[1].data.data, items[0]);
          $scope.chartConfig.series[0].name = $scope.actualDate.startDate + '~' + $scope.actualDate.endDate;
          $scope.chartConfig.series[1] = {id: 2, data: dataList2, name: $scope.compareDate.startDate + '~' + $scope.compareDate.endDate, visible: true}
        }

      });

    }

    function funcClick(data) {

      if ($scope.indicatorsOutput.length === 0 ) {
        $scope.indicatorsInput[0].ticked = true;
        $scope.indicatorsInput[1].ticked = true;
        $scope.indicatorsOutput = [$scope.indicatorsInput[0], $scope.indicatorsInput[1]];
      }

      if ($scope.indicatorsOutput.length > 2) {
        _.forEach($scope.indicatorsInput, function(n, key) {
          n.ticked = false;
          if (n.id === data.id) {
            n.ticked = true;
          }
        })
        $scope.indicatorsOutput = [data];
      }

      if ($scope.isCompared && $scope.indicatorsOutput.length >= 2) {
        _.forEach($scope.indicatorsInput, function(n, key) {
          n.ticked = false;
          if (n.id === data.id) {
            n.ticked = true;
          }
        })
        $scope.indicatorsOutput = [data];
      }

      _printChart();

    }

    function queryBtnClick() {
      _getData();
    }

    function isComparedWatcher() {
      $scope.compareDate = {
        startDate: moment($scope.actualDate.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
        endDate: moment($scope.actualDate.endDate).subtract(1, 'days').format('YYYY-MM-DD')
      }

      if ($scope.isCompared && $scope.indicatorsOutput.length >= 2) {
        var target = _.find($scope.indicatorsInput, {'id': $scope.indicatorsOutput[1].id});
        target.ticked = false;
        $scope.indicatorsOutput = [$scope.indicatorsOutput[0]];
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

    //按时、按日、按周、按月
    function setTimeRule(timeRule) {
      switch (timeRule) {
        case 'hour':
          $scope.chartConfig.xAxis.title.text = '/小时';
        break;
        case 'day':
          $scope.chartConfig.xAxis.title.text = '/天';
        break;
        case 'week':
          $scope.chartConfig.xAxis.title.text = '/周';
        break;
        case 'month':
          $scope.chartConfig.xAxis.title.text = '/月';
        break;
      }
      _.forEach($scope.timeRule, function(n, key) {
        $scope.timeRule[key] = false;
        $scope.timeRule[timeRule] = true;
      });

      var items = _.map($scope.indicatorsOutput, 'value'),
          timeRule = _.findKey($scope.timeRule, function(o) {
            return o === true;
          });

      _printChart();

    }

  }

})();
