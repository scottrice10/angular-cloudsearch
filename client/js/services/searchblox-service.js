/**
 * Created by cselvaraj on 4/29/14.
 */

//SERVICE
angular.module('searchblox.service', [])
  .service('searchbloxService', ['$rootScope', function($rootScope) {

    this.facetFieldsMap = new Object();

    /**
     * Function for reading facet.json file
     * */
    this.getFacetFields = function(facets) {
      var fields = "";
      var values = new Object();
      var urlParam = "";
      for(var i in facets) {

        fields = fields + '&facet.field=' + facets[i].field;
        if(facets[i].size !== undefined && facets[i].size !== null) {
          fields = fields + '&f.' + facets[i].field + '.size=' + facets[i].size;
        }

        values[facets[i].field] = {};
        values[facets[i].field]["display"] = facets[i].display;

        if(facets[i].slider) {
          values[facets[i].field]["slider"] = facets[i].slider;
        }

        if(facets[i].range !== undefined && facets[i].range !== null) {
          for(var r in facets[i].range) {
            urlParam = urlParam + '&f.' + facets[i].field + '.range=[' + facets[i].range[r]["from"] + 'TO' + facets[i].range[r]["to"] + ']';
          }
          values[facets[i].field]["range"] = facets[i].range;
        }

        if(facets[i].dateRange !== undefined && facets[i].dateRange !== null) {

          for(r in facets[i].dateRange) {
            urlParam = urlParam + '&f.' + facets[i].field + '.range=[' + moment().subtract(facets[i].dateRange[r]["calendar"], facets[i].dateRange[r]["value"]).format("YYYY-MM-DDTHH:mm:ss") + 'TO*]';
          }
          values[facets[i].field]["dateRange"] = facets[i].dateRange;
        }

      }

      fields = fields + urlParam;
      this.facetFieldsMap = values;
      return fields;
    }

    /**
     * Function for reading sort buttons from facet.json
     **/
    this.getSortBtns = function(sortBtns) {
      //var field = "";
      var values = new Object();
      for(var i in sortBtns) {
        //if(field == "") field = sortBtns[i].field;
        values[sortBtns[i].field] = new Object();
        values[sortBtns[i].field]["display"] = sortBtns[i].display;
        values[sortBtns[i].field]["sortVal"] = sortBtns[i].field;
      }
      return values;
      //this.sortBtns = values;
      // return field;
    };

    /**
     * Function for reading collection values from facet.json
     **/
    this.getCollectionValues = function(collection) {
      //var values = new Array();
      var collectionString = "";
      for(var i in collection) {
        console.log(i);
        //  values.push(collection[i]);
        collectionString = collectionString + '&col=' + collection[i];
      }
      //  this.collectionArray = values;
      return collectionString;
    };

    /**
     * Function to check if the sort value is valid
     */
    this.sortBtnExists = function(sortVal) {
      for(var i in this.sortBtns) {
        if(sortVal == i) return true;
      }
      return false;
    };

    // function for generating url
    this.getUrlParams = function(url, query) {
      var urlParam = url;

      if(typeof(query) !== "undefined" && query !== null) {
        urlParam = urlParam + "?&q=" + encodeURIComponent(query);
      }

      return urlParam;
    };

    function queryStringForMatchAny(queryString) {
      queryString = queryString.replace(/^\s+|\s+$/g, '').split(/[ ]+/).join('+');
      return queryString;
    }

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
      // resultobj["npages"] = new Array();
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
            //resultobj["pages"].push(dataobj.links.link[item]);
          }

        }
      }
      return resultobj;
    }

    // return array of advertisements
    function getAds(adsObj) {
      if(!angular.isArray(adsObj)) {
        if(adsObj.ad !== null && typeof(adsObj.ad) !== "undefined") {
          return [adsObj.ad];
        }
        return [adsObj];
      }
      else
        return adsObj;
    }

    // return array of Collections
    function getCollectionList(colObj) {
      if(!angular.isArray(colObj)) {
        if(colObj.ad !== null && typeof(colObj.collection) !== "undefined") {
          return [colObj.collection];
        }
        return [colObj];
      }
      else
        return colObj;
    }

    /**
     * Check if id's listed in collectionForAds are in the CollectionList
     * **/
    function showAds(colObj, colAds) {
      var colList = new Array();
      colList = getCollectionList(colObj);
      if(colAds !== null && colAds.length == 0) {
        return true;
      }
      for(var col in colList) {
        for(var ad in colAds) {
          if(colList[col]['@id'] == colAds[ad] && colList[col]['@checked'] == "true") {
            return true;
          }
        }
      }
      return false;
    }

    function computeAdsResult(result) {
      var computedResult = new Object();
      computedResult = angular.copy(result);
      var recstr = JSON.stringify(result['@url']);

      var colid = result.col;
      recstr = recstr.substring(1, recstr.length - 1);
      var t = recstr.substring(recstr.lastIndexOf('.') + 1).toLowerCase();
      var isImage = false;

      var tempurl = result['@url'];
      var t = tempurl.substring(tempurl.lastIndexOf('.') + 1).toLowerCase();
      if(t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
        isImage = true;
      }
      computedResult.contentUrl = result['@url'];
      computedResult.isImage = isImage;
      return computedResult;
    }

    // Moved this functions from old code to here to perform search
    // read the result object and return useful vals depending on if ES or SOLR
    // returns an object that contains things like ["data"] and ["facets"]
    this.parseResults = function(dataobj) {
      var resultobj = new Object();
      resultobj["records"] = new Array();
      resultobj["start"] = "";
      resultobj["found"] = "0";
      if(typeof(dataobj.hits) !== "undefined" && typeof(dataobj.hits.hit) !== "undefined") {
        dataobj.hits.hit.forEach(function(item) {
          resultobj["records"].push(item);
          resultobj["found"] = item.found;
        });
      }

      return resultobj;
    }
  }]);
