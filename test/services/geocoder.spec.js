describe('Unit:services:geocoder', function() {
  var geocoder;

  beforeEach(angular.mock.module('weatherHistory'));
  beforeEach(inject(function(_$injector_, _geocoder_) {
    $httpBackend = _$injector_.get('$httpBackend');

    $httpBackend.whenGET('templates/app.html')
      .respond(200, '');
    $httpBackend.whenGET('templates/backcasts.html')
      .respond(200, '');

    geocoder = _geocoder_;
  }));

  describe('getDeferredGeocode()', function() {
    it('should return latitude and longitude', function(done) {
      geocoder.getDeferredGeocode()
        .then(function(coordinates) {
          expect(angular.isNumber(coordinates.latitude)).toBe(true);
          expect(angular.isNumber(coordinates.longitude)).toBe(true);

          done();
        });
    });
  });

  describe('getDeferredLocation()', function() {
    it('should return a location when given latitude and longitude', function(done) {
      geocoder.getDeferredLocation()
        .then(function(location) {
          expect(location).toBeDefined();
          expect(location.address_components).toBeDefined();
          expect(location.address_components[3]).toBeDefined();
          expect(location.address_components[6]).toBeDefined();

          done();
        });
    });

  });
});
