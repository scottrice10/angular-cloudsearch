/**
 * Created by cselvaraj on 4/29/14.
 */

//SERVICE
angular.module('imorgo.service', [])
  .service('imorgoService', ['$rootScope', function($rootScope) {

    // function for generating url
    this.getUrlParams = function(url, query, facets, filterFields, sort, start) {
      var urlParam = url + "?";

      if(typeof(query) !== "undefined" && query !== null) {
        urlParam = urlParam + "&q=" + encodeURIComponent(query);
      }

      if(typeof(facets) !== "undefined" && facets !== null) {
        urlParam = urlParam + "&facets=" + encodeURIComponent(facets);
      }

      if(filterFields && filterFields.length > 0) {
        urlParam = urlParam + "&filters=" + encodeURIComponent(JSON.stringify(filterFields));
      }

      if(typeof(sort) !== "undefined" && sort !== null) {
        urlParam = urlParam + "&sort=" + encodeURIComponent(sort);
      }

      if(typeof(start) !== "undefined" && start !== null) {
        urlParam = urlParam + "&start=" + encodeURIComponent(start);
      }

      return urlParam;
    };

    // retrieves the auto suggestions
    this.parseAutoSuggestion = function(data) {
      var suggestions = [];
      data.hits.hit.forEach(function(entry) {
        suggestions.push(entry);
      });
      return suggestions;
    };

    // Moved this functions from old code to here to perform search
    // read the result object and return useful vals depending on if ES or SOLR
    // returns an object that contains things like ["data"] and ["facets"]
    this.parseResults = function(dataobj, facetMap) {
      var resultobj = {};
      resultobj["records"] = [];
      resultobj["start"] = "";

      resultobj["found"] = "" + dataobj.hits.found || "0";
      if(typeof(dataobj.hits) !== "undefined" && typeof(dataobj.hits.hit) !== "undefined") {
        dataobj.hits.hit.forEach(function(item) {
          resultobj["records"].push(item);
        });
      }

      resultobj["facets"] = dataobj.facets;
      for(var key in resultobj.facets){
        if(facetMap){
          facetMap.facets.forEach(function(jsonFacet){
            if(key === jsonFacet.field){
              resultobj.facets[key].label = jsonFacet.display;
            }
          });
        }
      }

      return resultobj;
    }
  }]);
