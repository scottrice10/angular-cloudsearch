/**
 * Created by cselvaraj on 4/29/14.
 */

// FACTORY
angular.module('searchblox.factory', []).factory('searchbloxFactory', ['$rootScope', '$http', function($rootScope, $http) {
  var searchFactory = new Object();
  searchFactory.getResponseData = function(urlParams) {
    return $http.get(urlParams);
  };
  return searchFactory;
}]);
