'use strict';
// CONTROLLER
angular.module('imorgo.controller', [])
  .controller('imorgoController', ['$rootScope', '$scope', '$http', '$location', 'imorgoService', 'imorgoFactory', 'facetFactory', '$q', '$timeout', '$sce',
    function($rootScope, $scope, $http, $location, imorgoService, imorgoFactory, facetFactory, $q, $timeout, $sce) {// 'autoCompleteFactory',

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

      $scope.paginationHtml = "";
      $scope.tagHtml = "";
      $scope.topHtml = "";
      $scope.startedSearch = false;
      $scope.initAds = 1;
      $scope.dataMap = new Object();
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
            $scope.facetMap.facets.forEach(function(facet) {
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

        var urlParams = imorgoService.getUrlParams(searchUrl, $scope.query, $scope.facetFields);
        imorgoFactory.getResponseData(urlParams).success(function(searchResults) {
          $scope.parsedSearchResults = imorgoService.parseResults(searchResults, $scope.facetMap);
          $scope.parsedLinks = imorgoService.parseLinks(searchResults);
          $scope.startedSearch = true;
          $scope.inputClass.name = "ngCustomInput col-sm-6 col-md-6 col-md-offset-2";
        }).error(function(err) {
          console.log(err);
        });
      };

      // Sort function
      $scope.doSort = function(sortVal) {
        $scope.dataMap['sortVal'] = sortVal;
        $scope.doSearch();
      };

      // Sort function
      $scope.doDirector = function(direction) {
        $scope.dataMap['sortDir'] = direction;
        $scope.doSearch();
      };

      // adjust how many results are shown
      $scope.howmany = function() {
        var newhowmany = prompt('Currently displaying ' + $scope.pageSize + ' results per page. How many would you like instead?');
        if(newhowmany) {
          $scope.pageSize = parseInt(newhowmany);
          $scope.from = 0;
          $scope.dosearch();
        }
      };

      // Function for search by filter.
      $scope.doSearchByFilter = function(filter, facetName, checkboxIndex) {
        $scope.page = 1;

        $scope.checked[checkboxIndex] = !$scope.checked[checkboxIndex];

        var filters = "",
          filterName = filter['@name'],
          searchReplacment = false,
          filter_index = -1,
          hasFilter = false;

        var newFilter = {};
        newFilter["id"] = $scope.selectedItems.size;
        newFilter['filterName'] = filterName;
        newFilter['facetName'] = facetName;
        newFilter['pageNo'] = $scope.prevPage;
        $scope.prevPage = $scope.page;

        $scope.prepareFilters = function() {
          if(!hasFilter || searchReplacment === true) {
            $scope.filterFields = filters + "&f." + facetName + ".filter=" + filterName;

            $scope.showInput = true;
            if(searchReplacment === true && filter_index > -1) {
              $scope.selectedItems[filter_index] = newFilter;
            } else {
              $scope.selectedItems.push(newFilter);
            }
          }
        };

        $scope.prepareFilters();
        $scope.doSearch();
      };

      // Function for fetch page results.
      $scope.fetchPage = function(pageNo) {
        $scope.page = pageNo;
        $scope.prevPage = pageNo;
        $scope.doSearch();
      };

      // check if there is at least one filter in the facet
      $scope.hasFacets = function() {
        return $scope.parsedSearchResults !== undefined && $scope.parsedSearchResults !== null && $scope.parsedSearchResults.facets !== null;
      };
    }]);
