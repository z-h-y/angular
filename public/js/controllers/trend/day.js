(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('TrendDayCtrl', TrendDayCtrl);

  TrendDayCtrl.$inject = ['$scope', 'Config', '$state', 'Actions', '$q', 'DTOptionsBuilder', 'DTColumnBuilder', '$filter', 'Utils'];

  function TrendDayCtrl($scope, Config, $state, Actions, $q, DTOptionsBuilder, DTColumnBuilder, $filter, Utils) {

    Config.getDtOptions(function(result) {
      $scope.dtOptions = result.withOption('searching', false)
                                .withOption('lengthChange', false)
                                .withOption('order', [1, 'desc'])
                                // .withOption('bSortable', false)
                                // .withOption('aTargets', ['nosort'])
                                .withOption('ajax', {
                                  url: '/admin/api/site/trendAnalysis/search?type=article&filter=' + JSON.stringify($scope.actualDate),
                                  type: 'GET',
                                  // dataSrc: function(json) {
                                  //   console.log(json);
                                  // }
                                  data: function(d, settings) {
                                    var index = d.order[0].column;
                                    d.order = d.columns[index].data + ',' + d.order[0].dir;
                                    delete d.columns;
                                    delete d.search;
                                  },
                                })
                                .withDataProp('data')
                                .withOption('processing', true)
                                .withOption('serverSide', true)
                                .withPaginationType('full_numbers');
    });
    $scope.dtColumns = [
      DTColumnBuilder.newColumn('title').withTitle('文章标题').renderWith(function(data, type, full) {
        var result = $filter('limitTo')(data, 50);
        result = data.length <= 50 ? result : result + '...';
        return '<a class="ng-scope" href="http://' + data + '" target="_blank" title="' + data + '">' + result + '</a>'
      }),
      DTColumnBuilder.newColumn('pv').withTitle('PV'),
      DTColumnBuilder.newColumn('uv').withTitle('UV'),
      DTColumnBuilder.newColumn('bounceRate').withTitle('跳出率'),
      DTColumnBuilder.newColumn('avgDuration').withTitle('平均访问时长(秒)'),
      // DTColumnBuilder.newColumn('avgPage').withTitle('平均访问页面')
    ];
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

    $scope.chartConfig = {
      options: {
        chart: {
          type: 'line',
          // reflow: false
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
      // yAxis: {
      //   allowDecimals: false,
      //   title: {text: '/个'},
      //   min: 0,
      //   startOnTick: false
      // },
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

    $scope.funcClick = funcClick;
    //固定时间段
    $scope.setRange = setRange;
    //统计图时间规则
    $scope.setTimeRule = setTimeRule;
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
      eventHandlers: {
        'apply.daterangepicker': _getData
      }
    }

    _init();

    function _init() {

      var currentUrl = $state.current.url.slice(1);

      $scope.indicatorsInput[0].ticked = true;
      $scope.indicatorsInput[1].ticked = true;
      $scope.indicatorsOutput = [$scope.indicatorsInput[0], $scope.indicatorsInput[1]];

      setRange(currentUrl);

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
      // $scope.chartConfig.yAxis = [];
      $scope.chartConfig.series = [];
      arr.push(Actions.trendAnalysis('chart', $scope.actualDate, timeRule, items));
      if ($scope.isCompared) {
        arr.push(Actions.trendAnalysis('chart', $scope.compareDate, timeRule, items))
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

    function _getData() {

      var aStartDate = moment($scope.actualDate.startDate).format('YYYY-MM-DD'),
          aEndDate = moment($scope.actualDate.endDate).format('YYYY-MM-DD');

      var ids = _.map($scope.indicatorsOutput, 'id');

      var diff = moment(aEndDate).diff(moment(aStartDate), 'days');

      if (diff > 30) {
        Utils.displayError('时间不能大于一个月');
        return;
      }

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

      Actions.trendAnalysis('summary', {'startDate': aStartDate, 'endDate': aEndDate })
        .then(function(data) {
          $scope.summaryList = [data.data.data];
          if ($scope.isCompared) {
            return Actions.trendAnalysis('summary', $scope.compareDate);
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

      if ($scope.dtOptions) {
        $scope.dtOptions.ajax.url = '/admin/api/site/trendAnalysis/search?type=article&filter=' + JSON.stringify($scope.actualDate);
      }
      // Actions.trendAnalysis('article', {'startDate': aStartDate, 'endDate': aEndDate })
      //   .then(function(data) {
      //     $scope.articleList = data.data.data;
      //   });

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
