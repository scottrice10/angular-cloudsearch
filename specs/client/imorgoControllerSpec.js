describe('imorgoController', function() {
  var $rootScope, $scope, $http, $location, imorgoService, imorgoFactory, facetFactory, $q, $timeout;

  // using angular mocks, we can inject the injector
  // to retrieve our dependencies
  beforeEach(module('imorgoModule'));
  beforeEach(inject(function($injector) {

    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $http = $injector.get('$http');
    $location = $injector.get('$location');
    imorgoService = $injector.get('imorgoService');
    imorgoFactory = $injector.get('imorgoFactory');
    facetFactory = $injector.get('facetFactory');
    $q = $injector.get('$q');
    $timeout = $injector.get('$timeout');
    $httpBackend = $injector.get('$httpBackend');

    var $controller = $injector.get('$controller');

    // used to create our AuthController for testing
    createController = function() {
      return $controller('imorgoController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        $location: $location,
        imorgoService: imorgoService,
        imorgoFactory: imorgoFactory,
        facetFactory: facetFactory,
        $q: $q,
        $timeout: $timeout
      });
    };

    $httpBackend.whenGET('views/main.html').respond(200);
    createController();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have a do search method', function() {
    $httpBackend.flush();
    expect($scope.doSearch).to.be.a('function');
  });

  it('should initially call do search', function() {
    // make a 'fake' reques to the server, not really going to our server
    $scope.doSearch();
    $httpBackend.whenGET('/api/search?&facets=').respond(
      {
        "status": {
          "rid": "67Kfjrcp25sBCuiaVQ==",
          "timems": 20
        },
        "hits": {
          "found": 77000,
          "start": 10,
          "hit": [
            {
              "id": "0be03cb0-1105-489a-8c36-11ef161a2df3",
              "fields": {
                "specialty_drugs_standard": [
                  "$150"
                ],
                "individual_3_or_more_children_age_21": [
                  "808.51"
                ]
              }
            }
          ]
        },
        "facets": {
          "metal_level": {
            "buckets": [
              {
                "value": "Bronze",
                "count": 22292
              }
            ]
          },
          "plan_type": {
            "buckets": [
              {
                "value": "EPO",
                "count": 5740
              }
            ]
          },
          "state": {
            "buckets": [
              {
                "value": "AK",
                "count": 44
              }
            ]
          }
        }
      });
    $httpBackend.flush();
    expect($scope.startedSearch).to.be(true);
  });

  it('should have a do search by filter method', function() {
    $httpBackend.flush();
    expect($scope.doSearchByFilter).to.be.a('function');
  });
});
