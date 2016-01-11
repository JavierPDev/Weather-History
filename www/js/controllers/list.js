(function() {
  'use strict';

  angular
    .module('weatherHistory.controllers')
    .controller('ListController', ListController);

  ListController.$inject = [
    '$scope',
    '$q',
    '$filter',
    '$cordovaSplashscreen',
    'settingsFactory',
    'geocoder',
    'forecastFactory'
  ];

  function ListController($scope, $q, $filter, $cordovaSplashscreen, settingsFactory, geocoder, forecastFactory) {
    $scope.loadData = loadData;
    $scope.reloadData = reloadData;
    $scope.canLoadData = canLoadData;
    $scope.models = {
      date: settingsFactory.date,
      place: {
        details: {},
        place: null
      }};
    $scope.list = [];
    var canLoad = true,
      yearsCheck = [],
      oldLatitude = null,
      oldLongitude = null,
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
            ss = moment(settings.date).format('ss'),
            promises = [];
          var ZZ = '';

          if (settings.latitude !== oldLatitude && settings.longitude !== oldLongitude) {
            oldLatitude = settings.latitude;
            oldLongitude = settings.longitude;

            geocoder.getTimezone(settings.latitude, settings.longitude, settings.date)
              .then(function(timezone) {
                ZZ = timezone.offset;
                settingsFactory.set({timezone: timezone});
                getAll();
              });
          } else {
            getAll();
          }

          function getAll() {
            for (var i = 0; i < LENGTH; i++) {
              var sub = oldLength + i * interval,
                time = YYYY-sub+'-'+MM+'-'+DD+'T'+HH+':'+mm+':'+ss+ZZ;
              yearsCheck.push(YYYY-sub);
              promises[i] = forecastFactory.getForecast(settings.latitude, settings.longitude, time, settings);
            }

            $q.all(promises)
              .then(function(results) {
                results = $filter('orderBy')(results, 'data.currently.time', true);
                angular.forEach(results, function(forecast) {
                  if (forecast.currently.icon) {
                    // Needed because sometimes forecast.io returns future dates when you ask for really old dates
                    // so we need to make sure we get the dates we wanted and at the same time not already listed.
                    // TODO: Switch to using ng-filter's 'unique' as in 'orderBy'
                    if (yearsCheck.indexOf(forecast.year) > -1 && !($scope.list.indexOf(forecast) > -1)) {
                      $scope.list.push(forecast);
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                  } else {
                    canLoad = false;
                  }
                });

                $cordovaSplashscreen.hide();
              });
          }
        });
    }


    /**
     * Reload data. Reset list, clear cache, and then load data. Used when
     * setting, date, or place change.
     *
     * @param {Boolean} pulledToRefresh - True if using pull to refresh directive
     */
    function reloadData(pulledToRefresh) {
      $scope.list = [];
      yearsCheck = [];
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
        $scope.latitude = parseFloat(newPlace.geometry.location.lat(), 10);
        $scope.longitude = parseFloat(newPlace.geometry.location.lng(), 10);
        settingsFactory.set({
          city: $scope.city,
          country: $scope.country,
          latitude: $scope.latitude,
          longitude: $scope.longitude
        });
        reloadData();
        loadData();
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
  }
})();
