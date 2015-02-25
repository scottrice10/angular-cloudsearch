angular.module('imorgo.trust', []).filter('trust', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  };
});