describe('Routing', function () {
  var $route;
  beforeEach(module('imorgoModule'));

  beforeEach(inject(function($injector){
    $route = $injector.get('$route');
  }));

  it('Should have / route, template, and controller', function () {
    expect($route.routes['/']).to.be.ok();
    expect($route.routes['/'].controller).to.be('imorgoController');
    expect($route.routes['/'].templateUrl).to.be('views/main.html');
  });
});
