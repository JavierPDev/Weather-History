angular.module('weatherHistory', [
    'ionic',
    'ngCordova',
    'angular-cache',
    'ngAutocomplete',
    '720kb.datepicker',
    'weatherHistory.controllers',
    'weatherHistory.services'
])

.constant('FORECASTIO_API_KEY', window.keys.forecastIo)
.constant('GOOGLE_API_KEY', '')

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

    ////////////////
    if(AdMob) {
      var admobid = {
          banner: window.keys.admob.banner
      };
      AdMob.createBanner({
        adId: admobid.banner, 
        position: AdMob.AD_POSITION.BOTTOM_CENTER, 
        autoShow: true,
        isTesting: true
      });
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

