(function() {
  'use strict';

  angular
    .module('adminApp')
    .factory('Config', Config);

  Config.$inject = ['DTOptionsBuilder'];

  function Config(DTOptionsBuilder) {

    var appTitle = 'AppGame主站数据统计后台';

    var menuList = [
      {
        name: 'dashboard',
        displayName: 'Dashboard',
        url: 'app.dashboard',
        icon: 'fa-dashboard'
      },

      /********* Add your app's menu item here *************/

      {
        name: 'general',
        displayName: '概况',
        url: 'app.general'
      },

      {
        name: 'trend',
        displayName: '趋势分析',
        url: 'app.trend',
        children: [
          {
            name: 'day',
            displayName: '今日统计',
            url: 'app.trend.day'
          },
          {
            name: 'week',
            displayName: '一周统计',
            url: 'app.trend.week'
          },
          {
            name: 'month',
            displayName: '最近30天',
            url: 'app.trend.month'
          }
        ]
      },

      {
        name: 'source',
        displayName: '来源分析',
        url: 'app.source',
        children: [
          {
            name: 'all',
            displayName: '全部来源',
            url: 'app.source.all'
          },
          {
            name: 'engine',
            displayName: '搜索引擎',
            url: 'app.source.engine'
          },
          {
            name: 'term',
            displayName: '搜索词',
            url: 'app.source.term'
          },
          {
            name: 'link',
            displayName: '外部链接',
            url: 'app.source.link'
          },
          {
            name: 'station',
            displayName: '站内来源',
            url: 'app.source.station'
          }
        ]
      },

      {
        name: 'page',
        displayName: '页面分析',
        url: 'app.page',
        children: [
          {
            name: 'webPage',
            displayName: '受访页面',
            url: 'app.page.webPage'
          },
          {
            name: 'domain',
            displayName: '受访域名',
            url: 'app.page.domain'
          }
        ]
      },

      /********* Add your app's menu item here *************/

      {
        name: 'admin',
        displayName: '后台管理',
        url: 'app.admin',
        icon: 'fa-cog',
        children: [
          {
            name: 'user',
            displayName: '用户设置',
            url: 'app.admin.user'
          },
          {
            name: 'role',
            displayName: '角色设置',
            url: 'app.admin.role'
          },
          {
            name: 'permission',
            displayName: '权限设置',
            url: 'app.admin.permission'
          },
          {
            name: 'codec',
            displayName: '编码设置',
            url: 'app.admin.codec'
          }
        ]
      }
    ];

    var tableWithLanguage = {
      'sProcessing': '处理中...',
      'sLengthMenu': '显示 _MENU_ 项结果',
      'sZeroRecords': '没有匹配结果',
      'sInfo': '显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项',
      'sInfoEmpty': '显示第 0 至 0 项结果，共 0 项',
      'sInfoFiltered': '(由 _MAX_ 项结果过滤)',
      'sInfoPostFix': '',
      'sSearch': '搜索:',
      'sUrl': '',
      'sEmptyTable': '表中数据为空',
      'sLoadingRecords': '载入中...',
      'sInfoThousands': ',',
      'oPaginate': {
        'sFirst': '首页',
        'sPrevious': '上页',
        'sNext': '下页',
        'sLast': '末页'
      },
      'oAria': {
        'sSortAscending': ': 以升序排列此列',
        'sSortDescending': ': 以降序排列此列'
      }
    };

    var multiSelectWithLanguage = {
      'selectAll': '全选',
      'selectNone': '全不选',
      'reset': '重置',
      'search': '搜索',
      'nothingSelected': '未选择'
    };
    var datePickerLanguage = {
      cancelLabel: '取消',
      applyLabel: '确定',
      customRangeLabel: '自定义',
      daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };

    function getDtOptions(cb) {
      var result = DTOptionsBuilder
        .newOptions()
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withBootstrap()
        .withLanguage(tableWithLanguage);
      if (cb) {
        return cb(result);
      }
      return result;
    }

    function configRoutes(routes) {
      /********* Add your app's route config here *************/
      routes.state('app.general', {
        url: '^/general',
        templateUrl: 'views/general.html',
        controller: 'GeneralCtrl'
      })
        .state('app.trend', {
          url: '^/trend',
          template: '<div ui-view></div>'
        })
        .state('app.trend.day', {
          url: '/day',
          templateUrl: 'views/trend/day.html',
          controller: 'TrendDayCtrl'
        })
        .state('app.trend.week', {
          url: '/week',
          templateUrl: 'views/trend/day.html',
          controller: 'TrendDayCtrl'
        })
        .state('app.trend.month', {
          url: '/month',
          templateUrl: 'views/trend/day.html',
          controller: 'TrendDayCtrl'
        })
        .state('app.page', {
          url: '^/page',
          template: '<div ui-view></div>'
        })
        .state('app.page.webPage', {
          url: '/webPage?website&date',
          templateUrl: 'views/page/webPage.html',
          controller: 'WebPageCtrl'
        })
        .state('app.page.viewChart', {
          url: '/viewChart?website&?date',
          templateUrl: 'views/page/viewChart.html',
          controller: 'ViewChartCtrl'
        })
        .state('app.page.domain', {
          url: '/domain',
          templateUrl: 'views/page/domain.html',
          controller: 'DomainCtrl'
        })
        .state('app.source', {
          url: '^/source',
          template: '<div ui-view></div>'
        })
        .state('app.source.all', {
          url: '/all',
          templateUrl: 'views/source/all.html',
          controller: 'SourceAllCtrl'
        })
        .state('app.source.engine', {
          url: '/engine',
          templateUrl: 'views/source/engine.html',
          controller: 'SourceEngineCtrl'
        })
        .state('app.source.term', {
          url: '/term',
          templateUrl: 'views/source/term.html',
          controller: 'SourceTermCtrl'
        })
        .state('app.source.link', {
          url: '/link',
          templateUrl: 'views/source/link.html',
          controller: 'SourceLinkCtrl'
        })
        .state('app.source.station', {
          url: '/station',
          templateUrl: 'views/source/station.html',
          controller: 'SourceStationCtrl'
        });


      /********* Add your app's route config here *************/
      return routes;
    }

    function prepareDynamicMenu() {
      /********* Prepare your app's dynamic menu here *************/



      /********* Prepare your app's dynamic menu here *************/
    }

    return {
      appTitle: appTitle,
      prepareDynamicMenu: prepareDynamicMenu,
      configRoutes: configRoutes,
      menuList: menuList,
      getDtOptions: getDtOptions,
      tableWithLanguage: tableWithLanguage,
      multiSelectWithLanguage: multiSelectWithLanguage,
      datePickerLanguage: datePickerLanguage,
      basePath: 'admin/api'
    };

  }

})();
