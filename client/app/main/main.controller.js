'use strict';

angular.module('trafikklysApp')
  .controller('MainCtrl', function ($scope, $http, $timeout, $compile) {

    $scope.markersArray = [],
    $scope.lat = false,
    $scope.lon = false;

    function placeMarker(location) {
        // first remove all markers if there are any
        deleteOverlays();

        var marker = new google.maps.Marker({
            position: location, 
            map: $scope.googleMap,
            icon: '/assets/images/bulb.png'
        });

        // add marker in markers array
        $scope.markersArray.push(marker);

        //map.setCenter(location);
    }

    // Deletes all markers in the array by removing references to them
    function deleteOverlays() {
        if ($scope.markersArray) {
            for (var i in $scope.markersArray) {
                $scope.markersArray[i].setMap(null);
            }
        $scope.markersArray.length = 0;
        }
    }

    function bindWindow(marker, index) {
        var contentString = '<div class="bodyContent">'+ $scope.loadedLights[index].info +'</div>' + 
                            '<br/><p>Sendt inn av <strong>'+ $scope.loadedLights[index].name +'</strong></p>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });      

        google.maps.event.addListener(marker, 'click', function() {          
          infowindow.open($scope.googleMap, marker);
        });
    }

    function loadMarkers() {
       $http.get('/api/lights').success(function(lights) {
          $scope.loadedLights = lights; 
          for (var i = 0; i < lights.length; i++) {  

            var marker = new google.maps.Marker({
              position: new google.maps.LatLng($scope.loadedLights[i].lat, $scope.loadedLights[i].lon),
              map: $scope.googleMap,
              title: $scope.loadedLights[i].name,
              icon: '/assets/images/bulb_yellow.png'
            }); 

            bindWindow(marker, i);  

          };
        });
    }

    $scope.coords = $(window).width() > 767 ? { lat: 66.315000, lon: 14.298423 } : { lat: 66.312383, lon: 14.147785 };

    $scope.map = {
        center: {  
            latitude: $scope.coords.lat,
            longitude: $scope.coords.lon
        },
        zoom: 12,
          events: {
            tilesloaded: function (map) {
              $scope.$apply(function () {
                // console.log(map);
                // add a click event handler to the map object
                $scope.googleMap = map;
                google.maps.event.addListener($scope.googleMap, "click", function(event)
                {
                    // place a marker
                    placeMarker(event.latLng);

                    // display the lat/lng in your form's lat/lng fields
                    $scope.lat = event.latLng.lat();
                    $scope.lon = event.latLng.lng();
                });
                loadMarkers();
              });
          }
        },
        options: {
          styles: [{"featureType":"water","stylers":[{"color":"#021019"}]},{"featureType":"landscape","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"transit","stylers":[{"color":"#146474"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]}]
        }
    };

    $scope.addLight = function() {
      if(!$scope.name || !$scope.description || !$scope.lat || !$scope.lon) {
        $('.alert-danger').fadeIn();
        $timeout(function() {      
          $('.alert-danger').fadeOut();
        }, 3000);
        return;
      }
      $http.post('/api/lights', { 
        name: $scope.name,
        info: $scope.description, 
        lat: $scope.lat,
        lon: $scope.lon
      }).success(function (data) {
        $('.alert-success').fadeIn();
        $timeout(function() {          
          $scope.name = '';
          $scope.description = '';
          $('.alert-success').fadeOut();
        }, 3000);
        loadMarkers();
      });
    };

  });
