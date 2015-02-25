angular.module('facetModule', ['ngResource'])
  .factory('facetFactory', function($resource) {
    return $resource('data/facet.json', {}, {
      get: {method: 'GET'}
    });
  });