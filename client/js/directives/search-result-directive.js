/**
 * Created by cselvaraj on 5/7/14.
 */

angular.module('imorgo.contentItem', []).
  directive('contentItem', function() {
    return {
      restrict: 'E',
      scope: {
        content: '='
      },
      templateUrl: 'views/component-templates/result.html',
      controller: function($scope) {

      }
    }
  });

