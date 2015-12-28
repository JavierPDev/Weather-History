(function() {
  'use strict';

  angular
    .module('weatherHistory.controllers')
    .controller('DetailsCtrl', DetailsCtrl);

  DetailsCtrl.$inject = [
    '$scope',
    '$state',
    'settingsFactory',
    'forecastFactory'
  ];

  function DetailsCtrl($scope, $state, settingsFactory, forecastFactory) {
    settingsFactory.getDeferred()
      .then(function(settings) {
        var timezone = settings.timezone.timeZoneId;
        forecastFactory.getForecast(settings.latitude, settings.longitude, $state.params.time, settings)
          .then(function (forecast) {
            forecast.data.daily.data[0].temperatureMaxTime = formatDate(forecast.data.daily.data[0].temperatureMaxTime, timezone);
            forecast.data.daily.data[0].temperatureMinTime = formatDate(forecast.data.daily.data[0].temperatureMinTime, timezone);
            forecast.data.daily.data[0].sunriseTime = formatDate(forecast.data.daily.data[0].sunriseTime, timezone);
            forecast.data.daily.data[0].sunsetTime = formatDate(forecast.data.daily.data[0].sunsetTime, timezone);
            forecast.data.year = parseInt(moment.unix(forecast.data.currently.time).format('YYYY'), 10);
            forecast.data.currently.icon = forecastFactory.renameIcons(forecast.data.currently.icon);
            $scope.details = forecast.data;
          });
      });

    function formatDate(date, timezone) {
      // Check if date needs to be formatted or if formatted date was cached
      if (date.toString().indexOf('m') > -1) {
        return date;
      } else {
        return moment.tz(date * 1000, timezone).format('h:mma');
      }
    }
  }
})();
