var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var cloudsearchdomain = require(__dirname + "/../config/endpoints").cloudsearchdomain;

// GET home page.
router.get('/', function(req, res) {
  res.render('index');
});

//Search api get request can take the following parameters:
//http://imorgo.com/api/search?
// query={searchTerm}&
// facet={[facetName1, facetName2]}&
// size={numberResultsReturnedPerRequest}&
// page={pageNumber}
router.get('/api/search', function(req, res) {
  var params = {};
  params.size = req.query.limit || 10;
  params.start = req.query.start || 0;
  params.partial = true;

  if(typeof req.query.q === "undefined" || req.query.fields) {
    params.queryOptions = '{"defaultOperator": "or"}';
    params.queryParser = 'structured';

    params.query = function() {
      var queryString = "(or ";
      if(req.query.q || req.query.filters) {
        var query = req.query.q ? "prefix '" + req.query.q + "'" : "";
        queryString += query;
      } else {
        queryString += "matchall";
      }

      if(req.query.filters) {
        var filtersArray = JSON.parse(req.query.filters);
        queryString += "(and ";
        filtersArray.forEach(function(filter) {
          queryString += "(term field=" + filter.term + " '" + filter.value + "')"
        });
        queryString += ")";
      }

      queryString += ")";
      return queryString;
    }();
  } else {
    params.query = req.query.q + "*";
    params.queryOptions = '{"defaultOperator": "or"}';
    params.queryParser = 'simple';
  }

  if(typeof req.query.sort !== "undefined") {
    params.sort = req.query.sort;
  }

  // only add facets to params if params sent in request
  if(typeof req.query.facets !== "undefined") {
    params.facet = function() {
      var facets = req.query.facets.split(",") || [];
      var facetsString = "{";
      for(var i = 0; i < facets.length; i++) {
        facetsString += '"' + facets[i] + '":{"sort":"bucket", "size":25}';

        if(i !== facets.length - 1) {
          facetsString += ",";
        }
      }
      facetsString += "}";

      return facetsString;
    }()
  }

  cloudsearchdomain.search(params, function(err, data) {
    if(err) {
      res.json(err);
      console.log(err, err.stack);
    } else {
      res.json(data);
    }
  });
});

//Search api post request takes only post object, which must be an array of properly formatted json objects
//** Note that an existing cloudsearch document cannot technically be updated. When a document with an existing id is
//uploaded, that document overwrites the document with that same id: http://docs.aws.amazon.com/cloudsearch/latest/developerguide/preparing-data.html.
//** Also note that limit for http post data is 2GB: http://stackoverflow.com/questions/2880722/is-http-post-limitless.
//http://imorgo.com/api/search?
router.post('/api/search', function(req, res) {
  var params = {
    contentType: 'application/json',
    documents: JSON.stringify(req.body)
  };

  cloudsearchdomain.uploadDocuments(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);
    }
    else {
      res.json(data);
    }
  });
});

//Search api delete request takes the following parameters:
//http://imorgo.com/api/search?
// ids={[id1, id2]}
router.delete('/api/search', function(req, res) {
  var docsToDelete = [];
  for(var i = 0; i < req.query.ids.length; i++) {
    var id = req.query.ids[i];
    docsToDelete.push({"type": "delete", "id": id});
  }

  var params = {
    contentType: 'application/json',
    documents: JSON.stringify(docsToDelete)
  };

  cloudsearchdomain.uploadDocuments(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);
    }
    else {
      res.json(data);
    }
  });
});

module.exports = router;
