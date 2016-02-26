(function() {
  'use strict';

  angular
    .module('adminApp')
    .controller('SourceAllCtrl', SourceAllCtrl);

  SourceAllCtrl.$inject = ['$scope', 'Config', '$state', 'Actions', '$q'];

  function SourceAllCtrl($scope, Config, $state, Actions, $q) {

    Config.getDtOptions(function(result) {
      $scope.dtOptions = result.withOption('searching', false)
                                .withOption('lengthChange', false)
                                .withOption('order', []);
    });
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
      {
        id: 7,
        value: 'avgPage',
        name: '平均访问页面'
      }
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

    $scope.chartConfig = {
      options: {
        chart: {
          type: 'line'
        },
        colors: ['#7cb5ec', '#f7c227', '#ED561B', '#91a9cf'],
        tooltip: {
          shared: true,
          crosshairs: true,
          borderWidth: 1
        },
        // plotOptions: {
        //   area: {
        //     fillColor: {
        //       linearGradient: [0, 0, 0, 300],
        //       stops: [
        //         [0, '#7cb5ec'],
        //         [1, 'rgba(124,181,236,0)']
        //       ]
        //     },
        //   }
        // },
        plotOptions: {
          series: {
            marker: {
              lineWidth: 1
            }
          }
        },
        legend: {
          itemStyle: {
            fontSize: '14px'
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
        title: {text: ' '},
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
    $scope.chartConfig2 = {
      options: {
        colors: ['#7cb5ec', '#f7c227', '#ED561B', '#91a9cf'],
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        }
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer'
          }
      },
      series: [],
      title: {
        text: ''
      },
      size: {
        height: 400
      }
    };
    $scope.chartConfig.yAxis = [
      { // left y axis
        title: {
            text: null
        },
        labels: {
            align: 'left',
            x: 3,
            y: 16,
            format: '{value:.,0f}'
        },
        allowDecimals: false,
        startOnTick: false,
        min: 0,
        showFirstLabel: false
      },
      // { // right y axis
      //   linkedTo: 0,
      //   gridLineWidth: 0,
      //   opposite: true,
      //   title: {
      //       text: null
      //   },
      //   labels: {
      //       align: 'right',
      //       x: -3,
      //       y: 16,
      //       format: '{value:.,0f}'
      //   },
      //   allowDecimals: false,
      //   startOnTick: false,
      //   min: 0,
      //   showFirstLabel: false
      // }
    ]

    $scope.indicatorsOutput = [];

    $scope.summaryList = [];

    $scope.funcClick = funcClick;
    //固定时间段
    $scope.setRange = setRange;
    //统计图时间规则
    $scope.setTimeRule = setTimeRule;

    $scope.actualDateOpts = {
      locale: Config.datePickerLanguage,
      eventHandlers: {
        'apply.daterangepicker': _getData
      }
    }

    _init();

    function _init() {

      $scope.indicatorsInput[0].ticked = true;
      $scope.indicatorsOutput = [$scope.indicatorsInput[0]];

      setRange('day');

    }

    function _printChart() {

      var items = _.map($scope.indicatorsOutput, 'value');
      var timeRule = _.findKey($scope.timeRule, function(o) {
        return o === true;
      });

      var arr = [];
      // $scope.chartConfig.yAxis = [];
      $scope.chartConfig.series = [];
      arr.push(Actions.sourceAnalysis('chart', $scope.actualDate, timeRule, items));
      
      var chartPromise = $q.all(arr);

      chartPromise.then(function(data) {
        var date = _.map(data[0].data.data[0].data, 'date');
        $scope.chartConfig.xAxis.categories = date;
        _.forEach(data[0].data.data, function(n, key) {
          var dataList = _.map(n.data, items[0]);
          $scope.chartConfig.series[key] = {id: key+1, data: dataList, name: n.name, visible: true};
        });
      });
    }

    function _printPie() {
      var items = _.map($scope.indicatorsOutput, 'value');
      var dataList2 = [];
      _.forEach($scope.articleList, function(n, key) {
        dataList2[key] = {};
        dataList2[key].name = n.title;
        dataList2[key].y = n[items[0]];
      });
      var indicator = _.find($scope.indicatorsOutput, 'value', items[0]);
      $scope.chartConfig2.series[0] = {data: dataList2, name: indicator.title, visible: true};
    }

    function _getData() {

      var aStartDate = moment($scope.actualDate.startDate).format('YYYY-MM-DD'),
          aEndDate = moment($scope.actualDate.endDate).format('YYYY-MM-DD');

      var ids = _.map($scope.indicatorsOutput, 'id');

      var diff = moment(aEndDate).diff(moment(aStartDate), 'days');

      Actions.sourceAnalysis('summary', {'startDate': aStartDate, 'endDate': aEndDate })
        .then(function(data) {
          $scope.summaryList = data.data.data;
        });
      
      _printChart();

      Actions.sourceAnalysis('article', {'startDate': aStartDate, 'endDate': aEndDate })
        .then(function(data) {
          $scope.articleList = data.data.data;
          _printPie();
        });
    }

    function funcClick(data) {

      if ($scope.indicatorsOutput.length === 0 ) {
        $scope.indicatorsInput[0].ticked = true;
        $scope.indicatorsOutput = [$scope.indicatorsInput[0]];
      }

      if ($scope.indicatorsOutput.length > 1) {
        _.forEach($scope.indicatorsInput, function(n, key) {
          n.ticked = false;
          if (n.id === data.id) {
            n.ticked = true;
          }
        })
        $scope.indicatorsOutput = [data];
      }

      _printChart();
      _printPie();

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
