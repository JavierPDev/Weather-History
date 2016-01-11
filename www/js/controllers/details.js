(function() {
  'use strict';

  angular
    .module('weatherHistory.controllers')
    .controller('DetailsController', DetailsController);

  DetailsController.$inject = [
    '$scope',
    '$state',
    'settingsFactory',
    'forecastFactory'
  ];

  function DetailsController($scope, $state, settingsFactory, forecastFactory) {
    settingsFactory.getDeferred()
      .then(function(settings) {
        forecastFactory.getForecast(settings.latitude, settings.longitude, $state.params.time, settings)
          .then(function (forecast) {
            $scope.details = forecast;
          });
      });
  }
})();
