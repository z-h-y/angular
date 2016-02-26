(function() {
  'use strict';

  angular
    .module('adminApp', [
      'ui.router',
      'restangular',
      'ngAnimate',
      'angular-loading-bar',
      'datatables',
      'datatables.bootstrap',
      'highcharts-ng',
      'ui.bootstrap',
      'ngSanitize',
      'ui.bootstrap.tpls',
      'ngFileUpload',
      'isteven-multi-select',
      'textAngular',
      'emojiApp',
      'daterangepicker'])
    .config(Config)
    .factory('httpRequestInterceptor', httpRequestInterceptor)
    .run(Run);

  Config.$inject = ['$stateProvider', '$urlRouterProvider', '$logProvider', '$provide', '$httpProvider'];
  Run.$inject = ['$rootScope', '$location', '$http', '$log', 'Restangular', 'Utils', 'Session', 'Config', '$stateProvider', '$urlRouterProvider'];

  function Config($stateProvider, $urlRouterProvider, $logProvider, $provide, $httpProvider) {
    $provide.factory('$stateProvider', function() {
      return $stateProvider;
    });
    $provide.factory('$urlRouterProvider', function() {
      return $urlRouterProvider;
    });
    // $urlRouterProvider.otherwise('/login');
    //添加http请求拦截器
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $logProvider.debugEnabled(false);
  }

  httpRequestInterceptor.$inject = ['$rootScope', 'Utils', '$q'];
  //创建http请求拦截器
  function httpRequestInterceptor($rootScope, Utils, $q) {
    var currentRequests = {};

    function addHttpRequest(conf) {
      var reg1 = /^admin\/api\/admin\/users/,
        reg2 = /admin\/api\/sessions\/\d/;

      if (!reg1.test(conf.url) && !reg2.test(conf.url)) {
        currentRequests[conf.url] = conf.promiseObj;
      }
    }

    function abortAllHttpRequests(httpRequests) {
      angular.forEach(httpRequests, function(promise, url) {
        promise && promise.resolve();
      });
    }

    function abortAllOldRequests() {
      var oldRequests = angular.copy(currentRequests);
      currentRequests = {};
      abortAllHttpRequests(oldRequests);
    }

    $rootScope.$on('$stateChangeSuccess', function() {
      abortAllOldRequests();
    });

    return {
      request: function(config) {
        var deferred = $q.defer();
        config.timeout = deferred.promise;
        addHttpRequest({
          url: config.url,
          promiseObj: deferred
        });
        return config;
      },

      requestError: function(rejection) {
        return $q.reject(rejection);
      },

      response: function(response) {
        return response || $q.when(response);
      },

      responseError: function(rejection) {
        switch (rejection.status) {
          case 0:
            break;
          case 401:
            Utils.displayError('您已经退出系统，请刷新页面重新登录!', 1200000);
            break;
          case 405:
            Utils.displayError('请求无效，请勿进行越权操作!');
            break;
          case 500:
            Utils.displayError('后台发生未知错误，请尽快通知系统管理员!', 1200000);
            break;
          default:
            Utils.displayError(rejection.status + '，请求失败！');
        }
        return $q.reject(rejection);
      }
    };
  }

  function Run($rootScope, $location, $http, $log, Restangular, Utils, Session, Config, $stateProvider, $urlRouterProvider) {
    // 设置路由
    var routes = $stateProvider.state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'views/index.html'
    })
      .state('app.dashboard', {
        url: '^/dashboard',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl',
        parent: 'app',
      })
      .state('app.admin', {
        url: '^/admin',
        template: '<div ui-view></div>',
        parent: 'app',
      })
      .state('app.admin.user', {
        url: '/user',
        templateUrl: 'views/admin/user.html',
        controller: 'UserCtrl'
      })
      .state('app.admin.role', {
        url: '/role',
        templateUrl: 'views/admin/role.html',
        controller: 'RoleCtrl'
      })
      .state('app.admin.permission', {
        url: '/permission',
        templateUrl: 'views/admin/permission.html',
        controller: 'PermissionCtrl'
      })
      .state('app.admin.codec', {
        url: '/codec',
        templateUrl: 'views/admin/codec.html',
        controller: 'CodecCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      });

    routes = Config.configRoutes(routes);

    $urlRouterProvider.otherwise('/login');

    // 全局变量
    $rootScope.globals = {
      user: {
        resolved: false,
        login: false
      },
      errors: [],
      isRefresh: true
    };

    /*** 设置 Restangular - start ***/
    Restangular.setBaseUrl(Config.basePath);
    // 解析将后台返回的JSON数据，抽取data以及pagination，显示错误与debug信息
    Restangular.addResponseInterceptor(function(data) {
      var extractedData;
      if (data && data.error) {
        Utils.displayError(data.error.message);
        extractedData = data;

        if (data.error.debugMessage) {
          $log.debug(data.error.debugMessage);
        }
      } else if (data.data) {
        extractedData = data.data;
        if (data.pagination) {
          extractedData.pagination = data.pagination;
        }
      } else {
        extractedData = data;
      }
      return extractedData;
    });

    // 处理后台401,500错误
    Restangular.setErrorInterceptor(function(response) {
      if (response.status === 401) {
        Utils.displayError('您已经退出系统，请刷新页面重新登录!', 1200000);
        return false; // error handled
      }
      if (response.status === 405) {
        Utils.displayError('请求无效，请勿进行越权操作!');
        return false; // error handled
      }
      if (response.status === 500) {
        Utils.displayError('后台发生未知错误，请尽快通知系统管理员!', 1200000);
        return false; // error handled
      }
      return true; // error not handled
    });
    /*** 设置 Restangular - end ***/

    // when route change, check user login
    $rootScope.$on('$locationChangeStart', function(ev, next) {
      var hash = next.split('#')[1];
      if (hash) {
        var user = $rootScope.globals.user;
        if (!user || !user.login) {
          $location.path('/login');
        } else if ((hash === '/login') && user && user.login) {
          ev.preventDefault();
        }
      } else {
        ev.preventDefault();
      }
    });

    // 当路由改变后，更新面包屑 Update breadcrumb when route changed
    $rootScope.$on('$locationChangeSuccess', function() {
      var menuList = Config.menuList,
        displayNameList = [];
      var breadcrumbList = _.compact($location.path().split('/'));
      for (var i = 0; i < menuList.length; i++) {
        if (menuList[i].name === breadcrumbList[0]) {
          displayNameList.push(menuList[i].displayName);
          getChildList(menuList[i], breadcrumbList, displayNameList, 1);
        }
      }
      $rootScope.displayNameList = displayNameList;
    });

    function getChildList(pMenuList, pBreadcrumbList, pDisplayNameList, pIndex) {
      for (var i = 0; i < pBreadcrumbList.length; i++) {
        if (pMenuList.children) {
          for (var j = 0; j < pMenuList.children.length; j++) {
            if (pMenuList.children[j].name === pBreadcrumbList[pIndex]) {
              pIndex = ++pIndex;
              pDisplayNameList.push(pMenuList.children[j].displayName);
              getChildList(pMenuList.children[j], pBreadcrumbList, pDisplayNameList, pIndex);
            }
          }
        }
      }
    }

    // 检查当前是否有用户登录，如果当前就是login页面则不检查
    // checking whether the user is logged in or not, if user is in login page, no need to check
    var currentPath = $location.path();
    var user = $rootScope.globals.user;
    if (currentPath !== '/login') {
      Session.one(1).get() // GET: /session
        .then(function(session) {
          if (session && session.name) {
            user.login = true;
            user.unavailable = false;
            user.id = session.id;
            user.name = session.name;
            $rootScope.$emit('setup-menu', {
              path: currentPath,
              isRefresh: true
            });
            if (currentPath && currentPath !== '/') {
              $location.path(currentPath);
            } else {
              $location.path('/dashboard');
            }
          } else {
            user.login = false;
            user.unavailable = true;
            $location.path('/login');
          }
        });
    } else {
      user.unavailable = true;
      $location.path('/login');
    }
  }

})();
