describe('Unit:services:settings', function(){
  var settings;

  beforeEach(angular.mock.module('weatherHistory'));
  beforeEach(inject(function(_$rootScope_, _$injector_, _settings_) {
    $httpBackend = _$injector_.get('$httpBackend');

    $httpBackend.whenGET('templates/app.html')
      .respond(200, '');
    $httpBackend.whenGET('templates/backcasts.html')
      .respond(200, '');

    $scope = _$rootScope_.$new();
    $scope.$digest();
    settings = _settings_;
  }));

  describe('getDeferred()', function() {
    it('should return settings', function(done) {
      settings.getDeferred()
        .then(function(returnedSettings) {
          expect(angular.isObject(returnedSettings)).toBe(true);
          done();
        });
    });

    it('should return settings containing coordinates', function(done) {
      settings.getDeferred()
        .then(function(returnedSettings) {
          expect(returnedSettings.coordinates.lat.match(/\d/)).toBe(true);
          expect(returnedSettings.coordinates.lon.match(/\d/)).toBe(true);
          done();
        });
    });

    it('should return settings containing interval', function(done) {
      settings.getDeferred()
        .then(function(returnedSettings) {
          expect(returnedSettings.interval.match(/\d/)).toBe(true);
          done();
        });
    });

    it('should return settings containing location', function(done) {
      settings.getDeferred()
        .then(function(returnedSettings) {
          expect(returnedSettings.location.city.match(/\w{2,}/)).toBe(true);
          expect(returnedSettings.location.country.match(/\w{2,}/)).toBe(true);
          done();
        });
    });

    it('should return settings containing localization', function(done) {
      settings.getDeferred()
        .then(function(returnedSettings) {
          expect(returnedSettings.localization.unitType.match(/\w{1}/)).toBe(true);
          expect(returnedSettings.localization.dateFormat.match(/\w{2}\/\w{2}/)).toBe(true);
          done();
        });
    });
  });

  describe('set()', function() {
    var newSettings = {
      interval: 2,
      coordinates: {
        lat: 41.8883,
        lon: 12.4869
      },
      localization: {
        unitType: 'C',
        dateFormat: 'DD/MM'
      },
      location: {
        city: 'Rome',
        country: 'Italy'
      }
    };

    it('should set settings', function(done) {
      settings.set(newSettings);

      settings.getDeferred()
        .then(function(returnedSettings) {
          expect(returnedSettings).toEqual(newSettings);
          
          done();
        });
    });

    it('should save new settings to localStorage', function(done) {
      settings.set(newSettings);

      var storedSettings = JSON.parse(window.localStorage['settings']);

      expect(storedSettings).toEqual(newSettings);
    });
  });

  describe('options', function() {
    var options;

    beforeEach(function() {
      options = settings.options;
    });

    it('should be an object', function() {
      expect(angular.isObject(options)).toBe(true);
    });

    it('should contain a dateFormat array with appropriate elements', function() {
      expect(options.dateFormat[0]).toBe('MM/DD');
      expect(options.dateFormat[1]).toBe('DD/MM');
    });

    it('should contain an interval array with appropriate elements', function() {
      expect(options.interval[0]).toBe(1);
      expect(options.interval[1]).toBe(5);
      expect(options.interval[2]).toBe(10);
    });

    it('should contain a unitType array with appropriate elements', function() {
      expect(options.unitType[0]).toBe('F');
      expect(options.unitType[1]).toBe('C');
    });
  });
});

