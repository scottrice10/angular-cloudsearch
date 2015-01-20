/**
 * Created by cselvaraj on 4/29/14.
 */
/**
 * @ngdoc directive
 * @name customInput.directive:customInput
 *
 * @description
 * ngCustomInput is an Angular directive that renders an input box with autosuggestions
 * Used mbenford's example taken from JSFiddle. Also moved the functions from old code to here
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {boolean=true} addOnEnter Flag performs a search on pressing the ENTER key.
 *
 */
angular.module('imorgo.custominput', [])
  .directive('custominput', ["$interpolate", function($interpolate) {
    function loadOptions(scope, attrs) {
      function getStr(name, defaultValue) {
        return attrs[name] ? $interpolate(attrs[name])(scope.$parent) : defaultValue;
      }

      function getBool(name, defaultValue) {
        var value = getStr(name, null);
        return value ? value === 'true' : defaultValue;
      }

      scope.options = {
        addOnEnter: getBool('addOnEnter', true)
      };
    }

    return {
      restrict: 'AE',
      scope: {searchParam: '=ngModel', onsearch: '=', inputstyle: "=inputstyle"},
      replace: false,
      transclude: true,
      template: '<div class="{{inputstyle.name}}">' +
      ' <div class="input-group input-group-sm">' +
      '    <span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>' +
      '    <input class="form-control" type="text"' +
      '           placeholder="search term"' +
      '           ng-model="searchParam"' +
      '           ng-change="newTagChange()">' +
      '</span>' +
      ' </div>' +
      '<div ng-transclude></div>' +
      '</div>',
      controller: ["$scope", "$attrs", "$element", function($scope, $attrs, $element) {

        loadOptions($scope, $attrs);

        this.getNewTagInput = function() {
          var input = $element.find('input');
          input.changeValue = function(value) {
            $scope.searchParam = value;
          };

          input.change = function(handler) {
            $scope.newTagChange = function() {
              handler($scope.searchParam);
            };
          };

          return input;
        };
      }],

      link: function(scope, element) {
        var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace];
        var input = element.find('input');

        input.bind('keydown', function(e) {
          var key;

          if(hotkeys.indexOf(e.keyCode) === -1) {
            return;
          }

          key = e.keyCode;
          if(key === KEYS.enter && scope.options.addOnEnter) {
            scope.onsearch();


          }
        });
        element.find('div').bind('click', function() {
          input[0].focus();
        });
      }
    };
  }]);
