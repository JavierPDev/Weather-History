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
  var expectedLength = 7,
    canLoad = true,
    LENGTH = 7;


  $scope.$on('list:reload', reloadData);
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
      if ($scope.list.length === expectedLength) {
        orderList($scope.list);
      }
    } else {
      canLoad = false;

      // Last two items end up switched so here's a hack
      var listLength = $scope.list,
        penUltimate, ultimate;
      angular.copy($scope.list[listLength-2], ultimate);
      angular.copy($scope.list[listLength-1], penUltimate);
      $scope.list[listLength-1] = penUltimate;
      $scope.list[listLength-2] = ultimate;
    }
  }

  /**
   * Order recently added elements of the list when api calls done to keep list in order.
   *
   * @param {Array} list - List of forecasts
   */
  function orderList(list) {
      var recentlyAdded = $scope.list.splice($scope.list.length - LENGTH, LENGTH);
      recentlyAdded = $filter('orderBy')(recentlyAdded, 'year', true);
      $scope.list = $scope.list.concat(recentlyAdded);
      expectedLength = expectedLength + LENGTH;
      $scope.$broadcast('scroll.infiniteScrollComplete');
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
    // Just wiping out the list sets off infinite scroll so this is out to avoid duplicates.
    // loadData();

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
        newDate = new Date(newDate);
        var YYYY = newDate.getFullYear(),
          MM = newDate.getMonth(),
          DD = newDate.getDate(),
          // Datepicker sets time to midnight so get back current time for new date
          now = new Date(),
          hh = now.getHours(),
          mm = now.getMinutes(),
          ss = now.getSeconds();

        newDate = new Date(YYYY, MM, DD, hh, mm, ss);
        settingsFactory.set({date: newDate});
        reloadData();
        loadData();
        $scope.$broadcast('DatepickerModal:closeModal');
      }
    }
  }
});

