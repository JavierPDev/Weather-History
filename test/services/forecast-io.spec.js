describe('Unit:services:forecastIo', function() {
  var forecastIo;

  beforeEach(angular.mock.module('weatherHistory'));
  beforeEach(inject(function(_$injector_, _forecastIo_) {
    $httpBackend = _$injector_.get('$httpBackend');

    $httpBackend.whenGET('templates/app.html')
      .respond(200, '');
    $httpBackend.whenGET('templates/backcasts.html')
      .respond(200, '');

    forecastIo = _forecastIo_;
  }));

  describe('getForecastAtTime()', function() {
    it('should return a forecasts at input time (units timestamp in seconds)', function(done) {
      forecastIo.getForecastAtTime()
        .success(function(data) {
          expect(angular.isNumber(data.currently.temperature)).toBe(true);
          done();
        });
    });
  });
});

