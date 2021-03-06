'use strict';

angular.module('myApp.view2', ['ngRoute', "ng.deviceDetector"])

    .controller('View2Ctrl', ['$scope', '$location', '$log', '$http', '$base64', 'deviceDetector', 'watchlistFactory', 'restServiceFactory', 'userServiceFactory',//'CompanyDetails',
        function ($scope, $location, $log, $http, $base64, deviceDetector, watchlistFactory, restServiceFactory, userServiceFactory) { //, CompanyDetails) {
            var root = 'http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST';
            $scope.filter = {
                offerType: 'thesis',
                country: 'all'
            };

            $scope.offers = [];
            $scope.offer = {};
            $scope.jobData = {};
            $scope.company = {};
            $scope.keyword = '';

            $scope.tmpWatchlist = [];
            initWatchlist();

            function initWatchlist() {
                watchlistFactory.init().success(function (data) {
                    var watchDataList = data;
                    for (var i = 0; i < data.offers.length; i++) {
                        $scope.tmpWatchlist.push(data.offers[i].id);

                    }
                })
                    .error(function (error) {
                        $scope.status = 'Unable to load watchlist data: ' + error.message;
                    });
            }

            $scope.deviceDetection = deviceDetector;
            $scope.isMobile = $scope.deviceDetection.isMobile();

            /*
            if (!$scope.isMobile) {
                var script = document.createElement("script");
                script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBSsGUEvpaUdzSUXS_S-5136GKJDNeVzTM";
                document.body.appendChild(script);
            }
            */

            $scope.startOffer = 0;
            $scope.endOffer = -1;
            /*  */

            $scope.getOffers = function () {
                if ($scope.isMobile) {
                    $scope.endOffer = 10;
                }


                var promise = restServiceFactory.getOffers($scope.keyword, $scope.filter.offerType, $scope.startOffer, $scope.endOffer);
                promise.then(function (response) {

                        $log.log(response);
                        $scope.offers = response.offers;
                        $scope.jobData = response;

                        $log.log($scope.jobData);

                    }, function (reason) {
                        $scope.status = 'Unable to load offer data: ' + error.message;
                    }
                );

                $scope.showPagination();

            };
            $scope.changePage = function (pageID, event) {
                event.preventDefault();
                if (pageID == -2 && $scope.startOffer + 10 < $scope.jobData.totalHits) {
                    $scope.startOffer += 10;
                    $scope.getOffers();
                } else if (pageID == -1 && $scope.startOffer > 9) {
                    $scope.startOffer -= 10;
                    $scope.getOffers();
                } else if (pageID > 0) {
                    $scope.startOffer = pageID * 10 - 10;
                    $scope.getOffers();
                }
            };
            $scope.getCompanyByID = function (id) {
                return $scope.jobData.companies[id];
            };
            $scope.getUniqueCountryList = function (list) {
                var uniqueList = [];
                for (var el in list) {
                    var isNew = true;
                    for (var i = 0; i < uniqueList.length; i++) {
                        if (list[el].city == uniqueList[i].city) {
                            isNew = false;
                            break;
                        }
                    }
                    if (isNew) {
                        uniqueList.push(list[el]);
                    }
                }
                return uniqueList;
            };
            $scope.filterCountry = function (input) {
                if ($scope.getCompanyByID(input.companyId).city == $scope.filter.country || $scope.filter.country == 'all') {
                    return true;
                }
                return false;
            };
            $scope.filterList = function () {
                $scope.getOffers();
            };
            $scope.showDetails = {};
            $scope.openOfferDetails = function (index) {
                $log.log("Öffne Offer Nr." + index);
                $scope.offer = $scope.offers[index];
                $log.log($scope.offer);
            };
            $scope.openCompanyDetails = function (companyID) {
                $log.log("Öffne Firma Nr." + companyID);

                $scope.company = $scope.jobData.companies[companyID];

                if (!$scope.isMobile) {
                    var mapProp = {
                        zoom: 13,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
                    var marker;
                    var geocoder = new google.maps.Geocoder();

                    var address = $scope.company.country + ',' + $scope.company.zipCode + ' ' + $scope.company.city + ',' + $scope.company.street;
                    geocoder.geocode({'address': address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location
                            });
                            marker.setMap(map);
                        } else {
                            $log.log('Adresse nicht gefunden');
                        }
                    });

                    jQuery('#myModalCompany').on('shown.bs.modal', function (e) {
                        google.maps.event.trigger(map, 'resize');
                        map.setCenter(marker.position);
                    });
                }

            };

            $scope.saveOffer = function (offerID) {
                watchlistFactory.addToWatchList(offerID);
                $scope.tmpWatchlist.push(offerID);
            };
            $scope.removeOffer = function (offerID) {
                watchlistFactory.removeFromWatchList(offerID);
                $scope.tmpWatchlist.splice($scope.tmpWatchlist.indexOf(offerID), 1);
            };
            $scope.isAlreadyWatched = function (offerId) {
                if ($scope.tmpWatchlist.indexOf(offerId) != -1) {
                    return true;
                } else {
                    return false;
                }
            }
            $scope.getPaginationNumber = function (offers) {
                var ar = [];
                if (offers !== undefined) {
                    var pageCount = Math.ceil($scope.jobData.totalHits / 10);
                    for (var i = 0; i < pageCount; i++) {
                        ar[i] = i;
                    }
                }
                return ar;
            }
            $scope.showPagination = function () {
                $log.log("Is mobile device: " + $scope.deviceDetection.isMobile());

                jQuery('.pagination>li').removeClass('active').eq($scope.startOffer / 10 + 1).addClass('active');

                if ($scope.isMobile && $scope.jobData.offers != null && $scope.jobData.totalHits >= 10) {
                    return true;
                } else {
                    return false;
                }
            }

            userServiceFactory.logout();
            $scope.getOffers();

        }
    ])
;


