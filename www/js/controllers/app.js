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
    $scope.selected = {};
    $scope.options = settingsFactory.options;

    settingsFactory.getDeferred()
      .then(function(settings) {
        $scope.settings = settings;
        $scope.selected = {
          dateFormat: settings.dateFormat,
          interval: settings.interval,
          units: settings.units
        };
      });

    $scope.saveNewSettings = function(newSettings) {
      settingsFactory.set(newSettings);
      $scope.$broadcast('list:reload');
    };
  }
})();

