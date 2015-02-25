/**
 * @ngdoc directive
 * @name customInput.directive:autocomplete
 *
 * @description
 * Provides autocomplete support for the customInput directive.
 * Used mbenford's example taken from JSFiddle for autocomplete.
 * @param {expression} source Callback that will be called for every keystroke and will be provided with the current
 *                            input's value. Must return a promise.
 */
angular.module('imorgo.autocomplete', [])
  .directive('autocomplete', ["$document", function($document) {
    function SuggestionList(loadFn) {
      var self = {};

      self.reset = function() {
        self.items = [];
        self.visible = false;
        self.index = -1;
        self.selected = null;
      };
      self.show = function() {
        self.selected = null;
        self.visible = true;
      };
      self.hide = function() {
        self.visible = false;
      };
      self.load = function(text) {
        if(self.selected === text) {
          return;
        }

        loadFn(text).then(function(items) {
          self.items = items;
          if(items.length > 0) {
            self.show();
          }
        });
      };
      self.selectNext = function() {
        self.select(++self.index);
      };
      self.selectPrior = function() {
        self.select(--self.index);
      };
      self.select = function(index) {
        if(index < 0) {
          index = self.items.length - 1;
        }
        else if(index >= self.items.length) {
          index = 0;
        }
        self.index = index;
        self.selected = self.items[index].id;
      };

      self.reset();

      return self;
    }

    return {
      restrict: 'AE',
      require: '?^custominput',
      scope: {
        source: '&'
      },
      template: '<div class="autocomplete" ng-show="suggestionList.visible">' +
      '  <ul class="suggestions">' +
      '    <li class="suggestion" ng-repeat="item in suggestionList.items track by item.id"' +
      '                           ng-class="{selected: item.id === suggestionList.selected}"' +
      '                           ng-click="addSuggestion()"' +
      '                           ng-mouseenter="suggestionList.select($index)">{{ item.fields.plan_marketing_name[0] }}</li>' +
      '  </ul>' +
      '</div>',
      link: function(scope, element, attrs, custominput) {
        var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down];
        var suggestionList = new SuggestionList(scope.source());
        var input = custominput.getNewTagInput();

        scope.suggestionList = suggestionList;

        scope.addSuggestion = function() {
          var added = false;

          suggestionList.items.forEach(function(entry) {
            if(entry.id === suggestionList.selected) {
              input.changeValue(entry.fields.plan_marketing_name[0]);
              suggestionList.reset();
              input[0].focus();

              added = true;
            }
          });

          return added;
        };

        input.change(function(value) {
          if(value) {
            suggestionList.load(value);
          } else {
            suggestionList.reset();
          }
        });

        input.bind('keydown', function(e) {
          var key, handled;

          if(hotkeys.indexOf(e.keyCode) === -1) {
            return;
          }

          if(suggestionList.visible) {
            key = e.keyCode;
            handled = false;

            if(key === KEYS.down) {
              suggestionList.selectNext();
              handled = true;
            }
            else if(key === KEYS.up) {
              suggestionList.selectPrior();
              handled = true;
            }
            else if(key === KEYS.escape) {
              suggestionList.reset();
              handled = true;
            }
            else if(key === KEYS.enter || key === KEYS.tab) {
              handled = scope.addSuggestion();
              if(!handled) {
                suggestionList.reset();
                scope.$apply();
              }
            }

            if(handled) {
              e.preventDefault();
              scope.$apply();
            }
          }
        });

        $document.bind('click', function() {
          if(suggestionList.visible) {
            suggestionList.reset();
            scope.$apply();
          }
        });
      }
    };
  }]);
