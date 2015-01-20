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
            $scope.facetMap.facets.forEach(function(facet){
              $scope.facetFields.push(facet.field);
            });

            if(typeof($scope.showAutoSuggest) == "undefined" || $scope.showAutoSuggest == null) {
              $scope.showAutoSuggest = data.showAutoSuggest;
            }
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
      $scope.doSearchByFilter = function(filter, facetName, rSlider) {
        $scope.page = 1;

        var filters = "",
          filterName = filter['@name'],
          filterRangeFrom = filter['@from'],
          filterRangeTo = filter['@to'],
          filterRangeCalendar = filter['@calendar'],
          filterRangeValue = filter['@value'],
          slider = filter['slider'] = (rSlider || false),
          searchReplacment = false,
          filter_index = -1,
          hasFilter = false;

        for(var i = 0, l = $scope.selectedItems.length; i < l; i++) {
          var obj = $scope.selectedItems[i];

          if(obj['filterRangeFrom'] !== undefined && obj['filterRangeTo'] !== undefined) {
            if(obj['facetName'] === facetName) {
              if((facetName === 'size' && obj['slider'] === slider) || facetName === 'lastmodified') {
                searchReplacment = true;
                filter_index = i;
              }
            }

            if((obj['filterName'] === filterName) && (obj['facetName'] === facetName)
              && obj['filterRangeFrom'] === filterRangeFrom
              && obj['filterRangeTo'] === filterRangeTo
            ) {
              hasFilter = true;
            } else {
              filters = filters + '&f.' + obj['facetName'] + '.filter=[' + obj['filterRangeFrom'] + 'TO' + obj['filterRangeTo'] + ']';
            }
          } else if(obj['filterRangeCalendar'] !== undefined && obj['filterRangeValue'] !== undefined) {
            if((obj['filterName'] === filterName) && (obj['facetName'] === facetName)
              && obj['filterRangeCalendar'] === filterRangeCalendar
              && obj['filterRangeValue'] === filterRangeValue
            ) {
              hasFilter = true;
            } else {
              filters = filters + '&f.' + obj['facetName'] + '.filter=[' + moment().subtract(obj['filterRangeCalendar'], obj['filterRangeValue']).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
            }
          } else {
            if((obj['filterName'] === filterName) && (obj['facetName'] === facetName)) {
              hasFilter = true;
            } else {
              filters = filters + "&f." + obj['facetName'] + ".filter=" + obj['filterName'];
            }
          }
        }

        var newFilter = {};
        newFilter["id"] = $scope.selectedItems.size;
        newFilter['filterName'] = filterName;
        newFilter['facetName'] = facetName;
        newFilter['filterRangeFrom'] = filterRangeFrom;
        newFilter['filterRangeTo'] = filterRangeTo;
        newFilter['filterRangeCalendar'] = filterRangeCalendar;
        newFilter['filterRangeValue'] = filterRangeValue;
        newFilter['slider'] = slider;
        newFilter['pageNo'] = $scope.prevPage;
        $scope.prevPage = $scope.page;

        $scope.prepareFilters = function() {
          if(!hasFilter || searchReplacment === true) {
            if(filterRangeFrom !== undefined && filterRangeTo !== undefined) {
              var rangeFilter = '';

              if(searchReplacment) {
                rangeFilter = '&f.' + facetName + '.filter=[' + filterRangeFrom + 'TO' + filterRangeTo + ']';
              } else {
                rangeFilter = filters + '&f.' + facetName + '.filter=[' + filterRangeFrom + 'TO' + filterRangeTo + ']';
              }

              $scope.filterFields = rangeFilter;
            } else if(filterRangeCalendar !== undefined && filterRangeValue !== undefined) {
              $scope.filterFields = filters + '&f.' + facetName + '.filter=[' + moment().subtract(filterRangeCalendar, filterRangeValue).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
            } else {
              $scope.filterFields = filters + "&f." + facetName + ".filter=" + filterName;
            }

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

      // Function for removing filter
      $scope.removeItem = function(index) {
        var selected_object = $scope.selectedItems[index];
        $scope.page = selected_object['pageNo']
        $scope.selectedItems.splice(index, 1);
        var filters = "";
        for(var i = 0, l = $scope.selectedItems.length; i < l; i++) { // for(var obj in $scope.selectedItems){
          var obj = $scope.selectedItems[i];
          if(obj['filterRangeFrom'] !== undefined && obj['filterRangeTo'] !== undefined) {
            filters = filters + '&f.' + obj['facetName'] + '.filter=[' + obj['filterRangeFrom'] + 'TO' + obj['filterRangeTo'] + ']';
          }
          else if(obj['filterRangeCalendar'] !== undefined && obj['filterRangeValue'] !== undefined) {
            filters = filters + '&f.' + obj['facetName'] + '.filter=[' + moment().subtract(obj['filterRangeCalendar'], obj['filterRangeValue']).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
          }
          else {
            filters = filters + "&f." + obj['facetName'] + ".filter=" + obj['filterName'];
          }
          // console.log("Remove Item In loop " + obj['filterName'] + " -- " + obj['facetName']);
        }
        $scope.filterFields = filters;
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
