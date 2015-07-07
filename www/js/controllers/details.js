angular.module('weatherHistory.controllers')
.controller('DetailsCtrl', function($scope, $state, settingsFactory, forecastFactory) {
  settingsFactory.getDeferred()
    .then(function(settings) {
      forecastFactory.getForecast(settings.latitude, settings.longitude, $state.params.time, settings)
        .then(function (forecast) {
          forecast.data.daily.data[0].temperatureMaxTime = moment(forecast.data.daily.data[0].temperatureMaxTime).format('hh:mm')
          forecast.data.daily.data[0].temperatureMinTime = moment(forecast.data.daily.data[0].temperatureMinTime).format('hh:mm')
          forecast.data.daily.data[0].sunriseTime = moment(forecast.data.daily.data[0].sunriseTime).format('hh:mm')
          forecast.data.daily.data[0].sunsetTime = moment(forecast.data.daily.data[0].sunsetTime).format('hh:mm')
          forecast.data.year = parseInt(moment.unix(forecast.data.currently.time).format('YYYY'), 10);
          forecast.data.currently.icon = forecastFactory.renameIcons(forecast.data.currently.icon);
          $scope.details = forecast.data;
        });
    });
});

