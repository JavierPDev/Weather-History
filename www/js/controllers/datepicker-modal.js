angular.module('weatherHistory.controllers')
.controller('DatepickerModalCtrl', function($scope, $ionicModal, settingsFactory) {
  var self = this;

  $ionicModal.fromTemplateUrl('templates/datepicker-modal.html', {
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
});

