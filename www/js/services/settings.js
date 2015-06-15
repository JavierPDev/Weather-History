angular.module('weatherHistory.services')
.factory('settingsFactory', function($q, $cordovaGeolocation, geocoder) {
  var settings = window.localStorage['settings'],
    startTime = new Date(),
    deferredSettings = $q.defer();

  // Use saved settings or create new ones if they don't exist
  if (settings) {
    settings = JSON.parse(settings);
    deferredSettings.resolve(settings);
  } else {
    // Settings object
    settings = {
      city: '',
      country: '',
      dateFormat: '',
      interval: 1,
      latitute: 0,
      longitutde: 0,
      units: ''
    };

    $cordovaGeolocation
      .getCurrentPosition()
      .then(function(pos) {
        settings.latitude = pos.coords.latitude;
        settings.longitude = pos.coords.longitude;
      }, function(err) {
        // Coordinates set to the Palatine Hill in Rome if not set or gotten from geolocation 
        settings.latitude = 41.8883;
        settings.longitude = 12.4869;
      })
      .finally(function() {
        geocoder.getDeferredLocation(settings.latitude, settings.longitude)
          .then(function(location) {
            settings.city = location.address_components[3].long_name;
            settings.country = location.address_components[6].long_name;
            angular.extend(settings, setLocalSettings(settings.country));
            set(settings);
            deferredSettings.resolve(settings);
          });
      });
  }

  /**
   * Set localization settings based on country.
   *
   * @function
   * @param {String} country - The country to get settings for
   * @return {Object} localization - Contains settings for user location
   */
  function setLocalSettings(country) {
    var localization;

    if (country.match(/United States/i)) {
      localization = {
        dateFormat: 'MM/DD',
        units: 'us'
      };
    } else {
      localization = {
        dateFormat: 'DD/MM',
        units: 'si'
      };
    }

    return localization;
  }


  /**
   * Get settings. Uses deferred since location and location based settings depends on async operation.
   *
   * @function
   * @return {Object} promise - Promise containing settings
   */
  function getDeferred() {
    return deferredSettings.promise;
  }

  /**
   * Change settings and save to localStorage.
   *
   * @param {Object} newSettings - Keys should match settings as above
   */
  function set(newSettings) {
    angular.extend(settings, newSettings);
    if (newSettings.country) {
      setLocalSettings(newSettings.country);
    }
    window.localStorage['settings'] = JSON.stringify(settings);
  }


  return {
    getDeferred: getDeferred,
    set: set,
    startTime: startTime,
    options: {
      dateFormat: ['MM/DD', 'DD/MM'],
      interval: [1, 5, 10],
      units: ['us', 'si', 'ca', 'uk', 'auto']
    }
  };
});

