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
    var vm = this;
    vm.closeModal = closeModal;
    vm.openModal = openModal;

    activate();

    //////////////
    
    function activate() {
      $ionicModal.fromTemplateUrl('common/views/datepicker.modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        vm.modal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        vm.modal.remove();
      });

      $scope.$on('DatepickerModal:closeModal', vm.closeModal);
    }

    function openModal() {
      vm.modal.show();
    }

    function closeModal() {
      vm.modal.hide();
    }
  }
})();
