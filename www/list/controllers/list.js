(function() {
  'use strict';

  angular
    .module('weatherHistory.list')
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
    var vm = this;
    vm.canLoadData = canLoadData;
    vm.list = [];
    vm.loadData = loadData;
    vm.reloadData = reloadData;
    vm.models = {
      date: settingsFactory.date,
      place: {
        details: {},
        place: null
      }};
    var canLoad = true;
    var oldLatitude = null;
    var oldLongitude = null;
    var LENGTH = 7;
    var yearsCheck = [];

    activate();

    ///////////////////
    
    function activate() {
      $scope.$on('list:reload', reloadData);
      $scope.$watch('vm.models.place.details', getNewPlace);
      $scope.$watch('vm.models.date', getNewDate);
    }

    /**
     * Load data from forecast.io. Used in infinite scroll and called whenever
     * settings or place change.
     */
    function loadData() {
      settingsFactory.getDeferred()
        .then(function(settings) {
          vm.city = settings.city;
          vm.country = settings.country;
          vm.formattedDate = moment(settings.date).format(settings.dateFormat);
          var interval = settings.interval;
          var oldLength = vm.list.length * interval;
          var YYYY = moment(settings.date).format('YYYY');
          var MM = moment(settings.date).format('MM');
          var DD = moment(settings.date).format('DD');
          var HH = moment(settings.date).format('HH');
          var mm = moment(settings.date).format('mm');
          var ss = moment(settings.date).format('ss');
          var promises = [];
          var ZZ = '';

          // Check if new location, if so use new timezone for proper date
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
              var sub = oldLength + i * interval;
              var time = YYYY-sub+'-'+MM+'-'+DD+'T'+HH+':'+mm+':'+ss+ZZ;
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
                    if (yearsCheck.indexOf(forecast.year) > -1 && !(vm.list.indexOf(forecast) > -1)) {
                      vm.list.push(forecast);
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
      vm.list = [];
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
        // Put city and country into vm
        angular.extend(vm, geocoder.parseAddressComponents(newPlace.address_components));
        vm.latitude = parseFloat(newPlace.geometry.location.lat(), 10);
        vm.longitude = parseFloat(newPlace.geometry.location.lng(), 10);
        settingsFactory.set({
          city: vm.city,
          country: vm.country,
          latitude: vm.latitude,
          longitude: vm.longitude
        });
        reloadData();
        loadData();
        vm.models.place.place = '';
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
          var YYYY = newDate.getFullYear();
          var MM = newDate.getMonth();
          var DD = newDate.getDate();
          // Datepicker sets time to midnight so get back current time for new date
          var now = new Date();
          var hh = now.getHours();
          var mm = now.getMinutes();
          var ss = now.getSeconds();

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
