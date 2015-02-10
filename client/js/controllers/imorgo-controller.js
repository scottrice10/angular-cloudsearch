'use strict';
// CONTROLLER
angular.module('imorgo.controller', [])
  .controller('imorgoController', ['$rootScope', '$scope', '$http', '$location', 'imorgoService', 'imorgoFactory', 'facetFactory', '$q', '$timeout',
    function($rootScope, $scope, $http, $location, imorgoService, imorgoFactory, facetFactory, $q, $timeout) {// 'autoCompleteFactory',

      var searchUrl = '/api/search';
      var autoSuggestUrl = searchUrl;

      $scope.facetFields = "";
      $scope.filterFields = "";
      $scope.selectedItems = [];
      $scope.from = 0;
      $scope.page = 1;
      $scope.prevPage = 1;
      $scope.noOfSuggests = 5;
      $scope.checked = [];
      $scope.filterFields = [];

      $scope.paginationHtml = "";
      $scope.tagHtml = "";
      $scope.topHtml = "";
      $scope.startedSearch = false;
      $scope.initAds = 1;
      $scope.dataMap = {};
      $scope.inputClass = {};
      $scope.inputClass.name = "ngCustomInput col-sm-8 col-md-8 col-md-offset-2";

      // load autosuggest items
      $scope.loadItems = function(term) {
        var autoSuggestData = $q.defer();
        imorgoFactory.getResponseData(autoSuggestUrl + '?limit=' + $scope.noOfSuggests + '&q=' + term).success(function(suggestionResults) {
          var suggtns = imorgoService.parseAutoSuggestion(suggestionResults);
          $scope.timer = $timeout(function() {
            $rootScope.$apply(autoSuggestData.resolve(suggtns));
          }, 10);
        }).error(function(err) {
          console.log(err);
        });
        return autoSuggestData.promise;

      };

      // Reads json data file and initializes the scope variables
      $scope.init = function() {
        facetFactory.get().$promise.then(function(data) {
          if(data !== null) {
            $scope.startedSearch = true;
            $scope.facetMap = data;
            $scope.facetFields = [];
            $scope.facetMap.facetFilters.forEach(function(facet) {
              $scope.facetFields.push(facet.field);
            });

            if(typeof($scope.showAutoSuggest) == "undefined" || $scope.showAutoSuggest == null) {
              $scope.showAutoSuggest = data.showAutoSuggest;
            }

            // init
            $scope.doSearch()
          }
        });
      };

      $scope.startSearch = function() {
        $scope.from = 0;
        $scope.page = 1;
        $scope.prevPage = 1;
        $scope.doSearch();
      };

      // Search function
      $scope.doSearch = function() {

        var urlParams = imorgoService.getUrlParams(searchUrl, $scope.query, $scope.facetFields, $scope.filterFields, $scope.sortField, $scope.start);
        imorgoFactory.getResponseData(urlParams).success(function(searchResults) {
          $scope.parsedSearchResults = imorgoService.parseResults(searchResults, $scope.facetMap);
          $scope.startedSearch = true;
          $scope.inputClass.name = "ngCustomInput col-sm-6 col-md-6 col-md-offset-2";
        }).error(function(err) {
          console.log(err);
        });
      };

      // Sort function
      $scope.doSort = function(field, isAscending) {
        $scope.isAscending = !$scope.isAscending;

        var direction = isAscending ? " asc" : " desc";
        $scope.sortField = field + direction;
        $scope.doSearch();
      };

      // Function for search by filter.
      $scope.doSearchByFilter = function(term, value) {
        $scope.page = 1;
        $scope.checked[value] = !$scope.checked[value];

        if($scope.checked[value]){
          $scope.filterFields.push({term : term, value: value});
        } else {
          $scope.filterFields.forEach(function(filter, i){
            if(filter.value == value){
              $scope.filterFields.splice(i, 1);
            }
          })
        }

        $scope.doSearch();
      };

      // Function for fetch page results.
      $scope.fetchPage = function(pageNo) {
        $scope.start = pageNo * 10;
        $scope.doSearch();
      };

      // check if there is at least one filter in the facet
      $scope.hasFacets = function() {
        return $scope.parsedSearchResults !== undefined && $scope.parsedSearchResults !== null && $scope.parsedSearchResults.facets !== null;
      };
    }]);
