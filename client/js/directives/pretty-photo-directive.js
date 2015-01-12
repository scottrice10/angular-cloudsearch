/**
 * Created by cselvaraj on 5/6/14.
 */

angular.module('searchblox.prettyp', [])
  .directive('prettyp', function() {
    return function(scope, element, attrs) {
      $("[rel^='prettyPhoto']").prettyPhoto({deeplinking: false});
    }
  });
