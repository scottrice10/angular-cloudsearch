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

    function getParam(paramName, urlString) {
      paramName = paramName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + paramName + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(urlString);
      if(results == null) {
        return "";
      }
      else {
        return results[1];
      }
    }

    this.parseLinks = function(dataobj, facetFieldsMap) {
      var resultobj = new Object();
      resultobj["pages"] = new Array();
      resultobj["sort"] = new Array();
      if(typeof(dataobj.links) !== "undefined" && typeof(dataobj.links.link) !== "undefined") {
        for(var item in dataobj.links.link) {
          if(dataobj.links.link[item] !== "undefined" && dataobj.links.link[item] != null
            && (dataobj.links.link[item]["@page"] === "date"
            || dataobj.links.link[item]["@page"] === "alpha"
            || dataobj.links.link[item]["@page"] === "relevance")) {
            resultobj["sort"].push(dataobj.links.link[item]);
          } else {
            var linkobj = new Object();
            linkobj['pageName'] = dataobj.links.link[item]["@page"];
            linkobj['pageNo'] = getParam('page', dataobj.links.link[item]["@url"]);
            linkobj['url'] = dataobj.links.link[item]["@url"]
            resultobj["pages"].push(linkobj);
          }

        }
      }
      return resultobj;
    };

    // Moved this functions from old code to here to perform search
    // read the result object and return useful vals depending on if ES or SOLR
    // returns an object that contains things like ["data"] and ["facets"]
    this.parseResults = function(dataobj, facetMap) {
      var resultobj = new Object();
      resultobj["records"] = new Array();
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
