(function() {
  'use strict';

  angular
    .module('weatherHistory.controllers')
    .controller('AppController', AppController);

  AppController.$inject = [
    '$scope',
    'settingsFactory'
  ];

  function AppController($scope, settingsFactory) {
    var vm = this;
    vm.options = settingsFactory.options;
    vm.selected = {};
    vm.saveNewSettings = saveNewSettings;

    activate();

    /////////

    function activate() {
      settingsFactory.getDeferred()
        .then(function(settings) {
          vm.settings = settings;
          vm.selected = {
            dateFormat: settings.dateFormat,
            interval: settings.interval,
            units: settings.units
          };
        });
    }

    function saveNewSettings(newSettings) {
      settingsFactory.set(newSettings);
      $scope.$broadcast('list:reload');
    };
  }
})();

