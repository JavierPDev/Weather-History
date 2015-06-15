angular.module('weatherHistory.controllers')
.controller('ListCtrl', function($scope, $timeout, $filter, $cordovaDatePicker, settingsFactory, geocoder, forecastFactory) {
  $scope.place = { place: null, details: {} };
  $scope.loadData = loadData;
  $scope.list = [];
  $scope.date = settingsFactory.startTime;
  var hintShown = false,
    expectedLength = 3,
    LENGTH = 3;


  $scope.$on('list:reload', reloadData);
  $scope.$watch('list.length', orderList);
  $scope.$watch('place.details', getNewPlace);


  /**
   * Load data from forecast.io. Used in infinite scroll and called whenever
   * settings or place change.
   */
  function loadData() {
    settingsFactory.getDeferred()
      .then(function(settings) {
        $scope.city = settings.city;
        $scope.country = settings.country;
        var oldLength = $scope.list.length;

        for (var i = 0; i < LENGTH; i++) {
          var time = moment($scope.date).subtract(oldLength + i, 'years').unix();
          forecastFactory.getForecast(settings.latitude, settings.longitude, time, settings)
            .then(handleData);
        }
      });
  }

  /**
   * Handle data received from api calls in loadData for loop.
   *
   * @param {Object} forecast - Forecast data
   */
  function handleData(forecast) {
    forecast.data.year = parseInt(moment.unix(forecast.data.currently.time).format('YYYY'), 10);
    $scope.list.push(forecast.data);
  }

  /**
   * Watch to see when api calls are done and list is full of new data.
   *
   * @param {Number} newLength - New length
   * @param {Number} oldLength - Old length
   */
  function orderList(newLength, oldLength) {
    if (newLength !== oldLength) {
      if (newLength === expectedLength) {
        expectedLength = expectedLength + LENGTH;
        $scope.list = $filter('orderBy')($scope.list, 'year', true);

        // orderList() ends up being called after api calls are done so this should be put here
        // especially since list is reordered just above 
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }
  }

  /**
   * Reload data. Reset backcasts and its expected length and then load data. Used when
   * settings change.
   */
  function reloadData() {
    $scope.list = [];
    expectedLength = 3;
    loadData();
  }

  /**
   * Watch function to handle user getting new location from google maps places search
   *
   * @param {Object} newPlace - New place from google search
   * @param {Object} oldPlace - Old place
   */
  function getNewPlace(newPlace, oldPlace) {
    if (newPlace !== oldPlace) {
      // Put city and country into $scope
      angular.extend($scope, geocoder.parseAddressComponents(newPlace.address_components));
      $scope.latitude = parseFloat(newPlace.geometry.location.A, 10);
      $scope.longitude = parseFloat(newPlace.geometry.location.F, 10);
      settingsFactory.set({
        city: $scope.city,
        country: $scope.country,
        latitude: $scope.latitude,
        longitude: $scope.longitude
      });
      $scope.list = [];
      expectedLength = LENGTH;
      loadData();
      $scope.place.place = '';
    }
  }

});

