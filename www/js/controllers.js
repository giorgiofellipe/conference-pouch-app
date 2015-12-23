angular.module('starter.controllers', [])
  .controller('AppCtrl', function($scope) {
  })
  .controller('ConferenceListCtrl', function($scope, $ionicModal, PouchDBService, $cordovaCamera, $ionicPlatform) {
    $scope.imageSrc = 'img/delorean.jpg';
    $scope.conferences = [];


    $scope.$on('add', function(event, conference) {
      console.log('add event received');
      $scope.refresh();
    });

    $scope.$on('delete', function(event, id) {
      console.log('delete event received');
      $scope.refresh();
    });

    $scope.refresh = function() {
      $scope.conferences = [];
      localDB.allDocs({attachments: true, include_docs: true, startkey: 'conference_'}).then(function(result) {
        angular.forEach(result.rows, function(row) {
          $scope.conferences.push(row.doc);
        });
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.refresh();

    $scope.like = function(conference) {
      conference.likes = conference.likes + 1;
      localDB.put(conference)
        .then(function(result){});
    };

    //Create modal
    $ionicModal.fromTemplateUrl("templates/conference-modal.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.showModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.conference = {};
      $scope.modal.hide();
    };

    $scope.save = function(conference) {

      conference.likes = 0;
      conference.comments = [];

      var now = new Date();
      conference._id = 'conference_' +  now.getTime();

      localDB.post(conference)
        .then(function(result) {
          $scope.conference = {};
          $scope.refresh();
          $scope.closeModal();
        })
        .catch(function(err) {
          alert('Whops!');
        });
    };

    $scope.choosePhoto = function(conference) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 320,
        targetHeight: 320,
        correctOrientation: true
      };

      $ionicPlatform.ready(function() {
        $cordovaCamera.getPicture(options)
          .then(function (imageData) {
            $scope.imageSrc = "data:image/jpeg;base64," + imageData;
            conference._attachments = {
              'conferenceImage': {
                content_type: 'image/jpeg',
                data: imageData
              }
            };
          }, function (err) {
            // error
          });
      });
    };
  })

  .controller('ConferenceCtrl', function($scope, $stateParams) {
    $scope.conference = {};
    $scope.$on('$ionicView.beforeEnter', function() {
      localDB.get($stateParams.conferenceId, {
        attachments: true,
        include_docs: true
      })
        .then(function(result) {
          $scope.conference = result;
          console.log($scope.conference);
        })
    });

    $scope.sendComment = function() {
      $scope.conference.comments[$scope.conference.comments.length] = $scope.comment;
      localDB.post($scope.conference)
        .then(function(result) {
        })
        .catch(function(err) {
          alert('Whops!');
        });
    };
  });
