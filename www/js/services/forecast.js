/**
 * ForecastIO service module
 * @module services/
 */
angular.module('weatherHistory.services')
.factory('forecastFactory', function($http, $q, CacheFactory, FORECASTIO_API_KEY) {
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
    var deferred = $q.defer(),
      cacheKey = '/forecast/'+time,
      queryParams = serialize(options);

    return $http.jsonp(baseUrl+latitude+','+longitude+','+time+'?callback=JSON_CALLBACK&'+queryParams, {cache: forecastCache});
  }

  /**
   * Clear forecast cache so fresh data can be available.
   */
  function clearCache() {
    forecastCache.removeAll();
  }

  /**
   * Serialize an object into a query paramater string or return empty string. Non-recursive.
   *
   * @param {Object} query - Query paramaters in key/value pairs
   * @return {String} queryString - Query parameters in valid string form or empty string if no input
   */
  function serialize(query) {
    // if (query) {
    //   var queryString = [];
    //
    //   angular.forEach(query, function(value, key) {
    //     this.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    //   }, queryString);
    //
    //   return queryString.join("&");
    // } else {
    //   return '';
    // }

    // Since the only option really being used is unitType we'll hardcode that in
    return '&units='+query.units;
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
});

