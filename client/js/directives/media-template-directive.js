/**
 * Created by cselvaraj on 5/7/14.
 */

angular.module('searchblox.contentItem', []).
  directive('contentItem', function() {
    return {
      restrict: 'E',
      scope: {
        content: '='
      },
      templateUrl: 'views/component-templates/href.html',
      controller: function($scope) {

      }
    }
  });

