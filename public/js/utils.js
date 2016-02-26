(function() {
  'use strict';

  angular
    .module('adminApp')
    .factory('Utils', Utils);

  Utils.$inject = ['$rootScope', '$timeout'];

  function Utils ($rootScope, $timeout) {
    var regExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    return {
      isComplexPassword: function(pwd) {
        var result = false;
        if (pwd && regExp.test(pwd)) {
            result = true;
        }
        return result;
      },
      displayError: function(messages, time) {
        time = time || 5000;
        var globals = $rootScope.globals;
        if (messages) {
          if (_.isObject(messages)) {
            globals.errors = _.map(messages, function(item) {
              if (_.isArray(item)) {
                return item[0];
              }
              return item;
            });
          } else if (_.isString(messages)) {
            globals.errors = [messages];
          }
          $timeout(function() {
            globals.errors = [];
          }, time);
        }
      },
      extractData: function(result) {
        if (result && result.data) {
          if (result.data.length > 1) {
            return result.data;
          } else {
            return result.data[0];
          }
        } else {
          return result;
        }
      },
      initSidebar: function() {
        $('#side-menu').find('li').has('ul').children('a').prop('onclick',null).off('click');
        $('#side-menu').metisMenu();
      },
      buildDtInstanceCb: function(scope, cb) {
        return function(dtInstance) {
          if (scope && cb && dtInstance && dtInstance.dataTable) {
            dtInstance.dataTable
            .on('length.dt', function() {
              scope.$apply(cb);
            })
            .on('page.dt', function() {
              scope.$apply(cb);
            });
          }
        };
      },
      //当周(结束时间为当周当天前一天)
      setCurrentWeek: function(cb) {
        var startDate = moment().startOf('week');
        var current = moment();
        var obj = {};

        if ( moment(startDate).isSame(current) ) {
          obj.startDate = startDate.subtract(1, 'weeks').format('YYYY-MM-DD');
        } else {
          obj.startDate = startDate.format('YYYY-MM-DD');
        }
        obj.endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        return cb(obj);
      },
      //当月(结束时间为当月当天前一天)
      setCurrentMonth: function(cb) {
        var startDate = moment().startOf('month');
        var current = moment();
        var obj = {};
        if ( moment(startDate).isSame(current) ) {
          obj.startDate = startDate.subtract(1, 'months').format('YYYY-MM-DD');
        } else {
          obj.startDate = startDate.format('YYYY-MM-DD');
        }
        obj.endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        return cb(obj);
      },
      //上月
      setPreviousMonth: function(cb) {
        var obj = {};
        obj.startDate = moment().startOf('month').subtract(1, 'months').format('YYYY-MM-DD');
        obj.endDate = moment().endOf('month').subtract(1, 'months').format('YYYY-MM-DD');
        return cb(obj);
      }
    };
  }

})();
