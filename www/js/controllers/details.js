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
        forecastFactory.getForecast(settings.latitude, settings.longitude, $state.params.time, settings)
          .then(function (forecast) {
            $scope.details = forecast;
          });
      });
  }
})();
