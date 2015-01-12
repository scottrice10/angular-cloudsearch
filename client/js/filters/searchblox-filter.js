/**
 * Created by cselvaraj on 4/29/14.
 */
angular.module('searchblox.trust',[]).filter('trust', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});