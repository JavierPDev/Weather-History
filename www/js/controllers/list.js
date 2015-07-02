angular.module('weatherHistory.controllers')
.controller('ListCtrl', function($scope, $filter, settingsFactory, geocoder, forecastFactory) {
  $scope.place = { place: null, details: {} };
  $scope.loadData = loadData;
  $scope.reloadData = reloadData;
  $scope.models = { date: forecastFactory.date };
  $scope.list = [];
  var expectedLength = 3,
    LENGTH = 3;


  $scope.$on('list:reload', reloadData);
  $scope.$on('$stateChangeSuccess', reloadData);
  $scope.$watch('list.length', orderList);
  $scope.$watch('place.details', getNewPlace);
  $scope.$watch('models.date', getNewDate);


  /**
   * Load data from forecast.io. Used in infinite scroll and called whenever
   * settings or place change.
   */
  function loadData() {
    settingsFactory.getDeferred()
      .then(function(settings) {
        $scope.city = settings.city;
        $scope.country = settings.country;
        $scope.formattedDate = moment(settings.date).format(settings.dateFormat);
        var oldLength = $scope.list.length;

        for (var i = 0; i < LENGTH; i++) {
          var time = moment(settings.date).subtract(oldLength + i, 'years').unix();
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
   * Watch to see when api calls are done and list is full of new data. Orders only new data.
   *
   * @param {Number} newLength - New length
   * @param {Number} oldLength - Old length
   */
  function orderList(newLength, oldLength) {
    if (newLength !== oldLength) {
      if (newLength === expectedLength) {
        var recentlyAdded = $scope.list.splice(newLength - LENGTH, LENGTH);
        recentlyAdded = $filter('orderBy')(recentlyAdded, 'year', true);
        $scope.list = $scope.list.concat(recentlyAdded);
        expectedLength = expectedLength + LENGTH;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }
  }

  /**
   * Reload data. Reset list and its expected length, clear cache, and then load data. Used when
   * setting, date, or place change.
   *
   * @param {Boolean} pulledToRefresh - True if using pull to refresh directive
   */
  function reloadData(pulledToRefresh) {
    $scope.list = [];
    expectedLength = LENGTH;
    forecastFactory.clearCache();
    loadData();

    // Make conditional since it uses javascript to scroll which triggers infinite scroll to
    // call its method (meaning data is duplicated).
    if (pulledToRefresh) {
      $scope.$broadcast('scroll.refreshComplete');
    }
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
      reloadData();
      $scope.place.place = '';
    }
  }

  /**
   * Watch function to handle getting new date from datepicker, closing the modal, and 
   * getting weather with new date.
   *
   * @param {Date} newDate - New date input
   * @param {Date} oldDate - Old date input
   */
  function getNewDate(newDate, oldDate) {
    if (newDate !== oldDate) {
      // TODO: Doesn't close when picking same day after changing months
      if (moment(newDate).isSame(oldDate, 'month')) {
        settingsFactory.set({date: newDate});
        reloadData();
        $scope.$broadcast('DatepickerModal:closeModal');
      }
    }
  }
});

