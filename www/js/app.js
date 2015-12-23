var localDB = new PouchDB("conferences");
var remoteDB = new PouchDB("http://192.168.1.19:5984/conferences");

angular.module('starter',
  [
    'ionic',
    'ngCordova',
    'starter.controllers'
  ])

.run(function($ionicPlatform) {
  localDB.sync(remoteDB, {live: true, retry: true});
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })
      .state('app.conferences', {
        url: '/conferences',
        views: {
          'menuContent': {
            templateUrl: 'templates/conference-list.html',
            controller: 'ConferenceListCtrl'
          }
        }
      })

      .state('app.conference', {
        url: '/conference/:conferenceId',
        views: {
          'menuContent': {
            templateUrl: 'templates/conference.html',
            controller: 'ConferenceCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/conferences');
  })
  .factory('PouchDBService', function($rootScope) {

    localDB.changes({
      since: 'now',
      continuous: true
    }).on('change', function(change) {
      console.log('change detected!');
      if (!change.deleted) {
        $rootScope.$apply(function() {
          localDB.get(change.id, function(err, doc) {
            $rootScope.$apply(function() {
              if (err) {
                console.log(err);
              }
              console.log('add');
              $rootScope.$broadcast('add', doc);
            })
          });
        })
      } else {
        $rootScope.$apply(function() {
          console.log('delete');
          $rootScope.$broadcast('delete', change.id);
        });
      }
    });

    localDB.createIndex({
      index: {
        fields: ['_id'],
        name: 'by_id',
        ddoc: 'conferences',
        type: 'json'
      }
    }).then(function (result) {
      console.log('create index success!');
    }).catch(function (err) {
      console.log('create index error! ' + JSON.stringify(err));
    });

    return true;
  });
