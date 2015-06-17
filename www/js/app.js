angular.module('weatherHistory', [
    'ionic',
    'ngCordova',
    'angular-cache',
    'ngAutocomplete',
    'weatherHistory.controllers',
    'weatherHistory.services'
])

.constant('FORECASTIO_API_KEY', '9e9741e9fd11d5fb18ec7986f6f5d5ec')

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.value('now', new Date())

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/app.html',
      controller: 'AppCtrl'
    })
    .state('app.list', {
      url: '/list',
      views: {
        'content': {
          templateUrl: 'templates/list.html',
          controller: 'ListCtrl'
        }
      }
    })
    .state('app.details', {
      url: '/list/:time',
      views: {
        'content': {
          templateUrl: 'templates/details.html',
          controller: 'DetailsCtrl'
        }
      }
    });

  $urlRouterProvider.otherwise('/app/list');
});

