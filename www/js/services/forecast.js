(function() {
  'use strict';

  angular
    .module('weatherHistory.services')
    .factory('forecastFactory', forecastFactory);

  forecastFactory.$inject = [
    '$http',
    '$q',
    'CacheFactory',
    'FORECASTIO_API_KEY'
  ];

  function forecastFactory($http, $q, CacheFactory, FORECASTIO_API_KEY) {
    var baseUrl = 'https://api.forecast.io/forecast/'+FORECASTIO_API_KEY+'/',
      MIN = 1000 * 60,
      forecastCache = CacheFactory.createCache('forecastCache', {
        maxAge: 15 * MIN,
        deleteOnExpire: 'aggressive'
      });

    /**
     * Get forecast for a location at a certain time.
     *
     * @param {Number} latitude - Latitude
     * @param {Number} longitude - Longitude
     * @param {Number} time - Unix timestamp in seconds
     * @param {Object} options - Options to pass as query parameters
     * @return {Object} promise - $http future object
     */
    function getForecast(latitude, longitude, time, options) {
      var deferred = $q.defer();
      options.callback = 'JSON_CALLBACK';

      return $http.jsonp(baseUrl+latitude+','+longitude+','+time, {
        cache: forecastCache,
        params: options
      });
    }

    /**
     * Clear forecast cache so fresh data can be available.
     */
    function clearCache() {
      forecastCache.removeAll();
    }

    /**
     * Method for renaming icon strings from forecast.io to fit weather icons set.
     *
     * @param {String} iconStr - String representing what icon to display. From forecast.io
     * @return {String} iconStr - String representing what icon to display. Modified for icon set
     */
    function renameIcons(iconStr) {
      iconStr = iconStr.replace('partly-', '');
      iconStr = iconStr.replace('wind', 'windy');
      iconStr = iconStr.replace('clear-day', 'day-sunny');
      iconStr = iconStr.replace('clear-night', 'night-clear');
      iconStr = iconStr.replace('cloudy-night', 'night-cloudy');
      iconStr = iconStr.replace('-day', '');
      return iconStr;
    }

    return {
      getForecast: getForecast,
      clearCache: clearCache,
      renameIcons: renameIcons
    };
  }
})();
