angular.module('weatherHistory.services')
.factory('geocoder', function($q, $http, CacheFactory, GOOGLE_API_KEY) {
  var geocoder = new google.maps.Geocoder(),
    deferredGeocode = $q.defer(),
    deferredLocation = $q.defer(),
    MIN = 60 * 1000,
    timezoneCache = CacheFactory.createCache('timezoneCache', {
      maxAge: 15 * MIN,
      deleteOnExpire: 'aggressive'
    }),
    timezoneApiUrl = 'https://maps.googleapis.com/maps/api/timezone/json';

  /**
   * Use google maps API to get coordinates from an address.
   *
   * @param {String} addr Address
   * @return {Object} Promise containing coordinates
   */
  function getGeocode(addr) {
    geocoder.geocode({address: addr}, function(data, status) {
      if(status === 'OK') {
        var coords = {
          latitude: parseFloat(data[0].geometry.location.k, 10),
          longitude: parseFloat(data[0].geometry.location.B, 10)
        };

        deferredGeocode.resolve(coords);
      } else {
        deferredGeocode.reject();
      }
    });

    return deferredGeocode.promise;
  }

  /**
   * Use google maps API to get a location from coordinates.
   *
   * @param {Number} latitud Latitude
   * @param {Number} longitude Longitude
   * @return {Object} Promise containing location
   */
  function getLocation(latitude, longitude) {
    var latLon = new google.maps.LatLng(latitude, longitude);

    geocoder.geocode({'latLng': latLon}, function(location, status) {
      if (status == google.maps.GeocoderStatus.OK && location.length > 0) {
        deferredLocation.resolve(location[0]);
      } else {
        deferredLocation.reject();
      }
    });

    return deferredLocation.promise;
  }

  function getTimezone(latitude, longitude) {
    var location = latitude+','+longitude;
    return $http.get(timezoneApiUrl, {
      cache: timezoneCache,
      params: {
        key: GOOGLE_API_KEY,
        location: location,
        timestamp: Math.floor(Date.now() / 1000)
      },
      url: timezoneApiUrl
    });
  }

  /**
   * Parse address components gotten from google maps places api.
   *
   * @param {Array} components Components
   * @return {Object} components City and country
   */
  function parseAddressComponents(components) {
    var city, country;

    angular.forEach(components, function(component) {
      if (component.types[0] === 'locality') {
        city = component.long_name;
      }
      if (component.types[0] === 'country') {
        country = component.long_name;
      }
    });

    return {
      city: city,
      country: country
    };
  }

  return {
    getGeocode: getGeocode,
    getLocation: getLocation,
    getTimezone: getTimezone,
    parseAddressComponents: parseAddressComponents
  };
});

