angular.module('weatherHistory.controllers')
.controller('ListCtrl', function($scope, $filter, settingsFactory, geocoder, forecastFactory) {
  $scope.loadData = loadData;
  $scope.reloadData = reloadData;
  $scope.canLoadData = canLoadData;
  $scope.models = {
    date: forecastFactory.date,
    place: {
      details: {},
      place: null
    }};
  $scope.list = [];
  var expectedLength = 3,
    canLoad = true,
    LENGTH = 3;


  $scope.$on('list:reload', reloadData);
  $scope.$watch('list.length', orderList);
  $scope.$watch('models.place.details', getNewPlace);
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
        var interval = settings.interval, 
          oldLength = $scope.list.length * interval,
          YYYY = moment(settings.date).format('YYYY'),
          MM = moment(settings.date).format('MM'),
          DD = moment(settings.date).format('DD'),
          HH = moment(settings.date).format('HH'),
          mm = moment(settings.date).format('mm'),
          ss = moment(settings.date).format('ss');

        for (var i = 0; i < LENGTH; i++) {
          var sub = oldLength + i * interval,
            time = YYYY-sub+'-'+MM+'-'+DD+'T'+HH+':'+mm+':'+ss;
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
    // Check we're still getting data otherwise stop infinite scroll
    if (forecast.data.currently.icon) {
      forecast.data.year = parseInt(moment.unix(forecast.data.currently.time).format('YYYY'), 10);
      forecast.data.currently.icon = forecastFactory.renameIcons(forecast.data.currently.icon);
      $scope.list.push(forecast.data);
    } else {
      canLoad = false;

      // Last two items end up switched so here's a hack
      var listLength = $scope.list,
        penUltimate, ultimate;
      angular.copy($scope.list[listLength-2], ultimate),
      angular.copy($scope.list[listLength-1], penUltimate);
      $scope.list[listLength-1] = penUltimate;
      $scope.list[listLength-2] = ultimate;
    }
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
    canLoad = true;
    forecastFactory.clearCache();
    loadData();

    // Make conditional since it uses javascript to scroll which triggers infinite scroll to
    // call its method (meaning data is duplicated).
    if (pulledToRefresh) {
      $scope.$broadcast('scroll.refreshComplete');
    }
  }

  /**
   * Used when older forecasts can't be retrieved anymore.
   *
   * @return {Boolean} canLoad - Whether data can be loaded
   */
  function canLoadData() {
    return canLoad;
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
      $scope.models.place.place = '';
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

