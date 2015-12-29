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
      var url = baseUrl+latitude+','+longitude+','+time;
      options.callback = 'JSON_CALLBACK';

      $http
        .jsonp(url, {
          cache: forecastCache,
          params: options
        })
        .then(function(res) {
          var forecast = processData(res.data, options.timezone.timezoneId);
          deferred.resolve(forecast);
        })
      return deferred.promise;
    }

    /**
     * Clear forecast cache so fresh data can be available.
     */
    function clearCache() {
      forecastCache.removeAll();
    }

    /**
     * Process forecast data into human readable format
     *
     * @param {Object} forecast - Forecast data to process
     * @param {String} timezone - Timezone of forecast
     * @return {Object} forecast - Forecast data formatted for user
     */
    function processData(forecast, timezone) {
      forecast.year = parseInt(moment.unix(forecast.currently.time).format('YYYY'), 10);
      forecast.daily.data[0].temperatureMaxTime = formatDate(forecast.daily.data[0].temperatureMaxTime, timezone);
      forecast.daily.data[0].temperatureMinTime = formatDate(forecast.daily.data[0].temperatureMinTime, timezone);
      forecast.daily.data[0].sunriseTime = formatDate(forecast.daily.data[0].sunriseTime, timezone);
      forecast.daily.data[0].sunsetTime = formatDate(forecast.daily.data[0].sunsetTime, timezone);
      forecast.year = parseInt(moment.unix(forecast.currently.time).format('YYYY'), 10);
      forecast.currently.icon = renameIcons(forecast.currently.icon);
      return forecast;
    }

    /**
     * Format date in forecast
     *
     * @param {String} date - Date of forecast
     * @param {String} timezone - Timezone of forecast
     * @return {String} date - Formatted date
     */
    function formatDate(date, timezone) {
      // Check if date needs to be formatted or if formatted date was cached
      if (date.toString().indexOf('m') > -1) {
        return date;
      } else {
        return moment.tz(date * 1000, timezone).format('h:mma');
      }
    }

    /**
     * Rename icon strings from forecast.io to fit weather icons set.
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
      clearCache: clearCache
    };
  }
})();
