(function() {
  'use strict';

  angular
    .module('weatherHistory.details')
    .controller('DetailsController', DetailsController);

  DetailsController.$inject = [
    '$state',
    'settingsFactory',
    'forecastFactory'
  ];

  function DetailsController($state, settingsFactory, forecastFactory) {
    var vm = this;

    activate();

    /////////////
    
    function activate() {
      settingsFactory.getDeferred()
        .then(function(settings) {
          vm.city = settings.city;
          vm.country = settings.country;

          forecastFactory.getForecast(settings.latitude, settings.longitude, $state.params.time, settings)
            .then(function (forecast) {
              vm.details = forecast;
            });
        });
    }
  }
})();
