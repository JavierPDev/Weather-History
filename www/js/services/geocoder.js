angular.module('weatherHistory.services')
.factory('geocoder', function($q) {
  var geocoder = new google.maps.Geocoder(),
    deferredGeocode = $q.defer(),
    deferredLocation = $q.defer();

  /**
   * Use google maps API to get coordinates from an address.
   *
   * @param {String} addr Address
   * @return {Object} Promise containing coordinates
   */
  function getDeferredGeocode(addr) {
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
  function getDeferredLocation(latitude, longitude) {
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
    getDeferredGeocode: getDeferredGeocode,
    getDeferredLocation: getDeferredLocation,
    parseAddressComponents: parseAddressComponents
  };
});
