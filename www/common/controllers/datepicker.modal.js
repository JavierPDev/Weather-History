(function() {
  'use strict';

  angular
    .module('weatherHistory.common')
    .controller('DatepickerModalController', DatepickerModalController);

  DatepickerModalController.$inject = [
    '$scope',
    '$ionicModal'
  ];

  function DatepickerModalController($scope, $ionicModal) {
    var self = this;

    $ionicModal.fromTemplateUrl('common/views/datepicker.modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      self.modal = modal;
    });

    self.openModal = function() {
      self.modal.show();
    };

    self.closeModal = function() {
      self.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      self.modal.remove();
    });

    $scope.$on('DatepickerModal:closeModal', self.closeModal);
    }
})();
