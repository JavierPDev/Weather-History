(function() {
  'use strict';

  angular
    .module('weatherHistory.common')
    .factory('forecastFactory', forecastFactory);

  forecastFactory.$inject = [
    '$http',
    '$q',
    'CacheFactory',
    'FORECASTIO_API_KEY'
  ];

  function forecastFactory($http, $q, CacheFactory, FORECASTIO_API_KEY) {
    var service = {};
    service.clearCache = clearCache;
    service.getForecast = getForecast;

    var baseUrl = 'https://api.darksky.net/forecast/'+FORECASTIO_API_KEY+'/';
    var MIN = 1000 * 60;
    var forecastCache = CacheFactory.createCache('forecastCache', {
      maxAge: 15 * MIN,
      deleteOnExpire: 'aggressive'
    });

    return service;

    /////////////////

    /**
     * Get forecast for a location at a certain time.
     *
     * @param {Number} latitude - Latitude
     * @param {Number} longitude - Longitude
     * @param {Number} time - Unix timestamp in seconds
     * @param {Object} params - Options to pass as query parameters
     * @return {Object} promise - Promise with resolved forecast data
     */
    function getForecast(latitude, longitude, time, params) {
      var deferred = $q.defer();
      var url = baseUrl+latitude+','+longitude+','+time;
      params.callback = 'JSON_CALLBACK';

      $http
        .jsonp(url, {
          cache: forecastCache,
          params: params,
          transformResponse: transformResponse
        })
        .then(function(res) {
          deferred.resolve(res.data);
        });
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
     * @return {Object} forecast - Forecast data formatted for user
     */
    function transformResponse(forecast) {
      forecast.year = parseInt(moment.unix(forecast.currently.time).format('YYYY'), 10);
      forecast.daily.data[0].temperatureMaxTime = formatDate(forecast.daily.data[0].temperatureMaxTime, forecast.timezone);
      forecast.daily.data[0].temperatureMinTime = formatDate(forecast.daily.data[0].temperatureMinTime, forecast.timezone);
      forecast.daily.data[0].sunriseTime = formatDate(forecast.daily.data[0].sunriseTime, forecast.timezone);
      forecast.daily.data[0].sunsetTime = formatDate(forecast.daily.data[0].sunsetTime, forecast.timezone);
      forecast.currently.icon = renameIcons(forecast.currently.icon);
      return forecast;
    }

    /**
     * Format date in forecast if it needs or ignore if formatted date cached
     *
     * @param {String} date - Date of forecast
     * @param {String} timezone - Timezone of forecast
     * @return {String} date - Formatted date
     */
    function formatDate(date, timezone) {
      var dateIsFormatted = date.toString().indexOf('m') > -1;
      if (dateIsFormatted) {
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
  }
})();
