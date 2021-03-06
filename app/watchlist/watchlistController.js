/**
 * Created by tpf on 28.10.15.
 */

'use strict';

angular.module('myApp.watchlistController', ['ngRoute'])

    .controller('watchlistCtrl', ['$scope', '$log', '$http','$base64', 'watchlistFactory',

        function($scope, $log, $http, $base64, watchlistFactory) {
            $scope.showNavbar = true;
            $scope.watchlist = {};
            $scope.watchlistOffers = [];
            $scope.offer={};

            initWatchlist();

            function initWatchlist() {
                watchlistFactory.init().success(function (data) {
                    $scope.watchlist = data;
                    $scope.watchlistOffers = $scope.watchlist.offers;

                })
                    .error(function (error) {
                        $scope.status = 'Unable to load customer data: ' + error.message;
                    });
            }

            $scope.removeOffer = function(offerId){
                watchlistFactory.removeFromWatchList(offerId).success(function(){
                    $scope.watchlistOffers = [];

                    for(var offer in $scope.watchlist.offers){

                        if($scope.watchlist.offers[offer].id != offerId){
                            $scope.watchlistOffers.push($scope.watchlist.offers[offer]);
                        }

                    }
                }).error(function (error) {
                    $scope.status = 'Unable to remove watchlist data: ' + error.message;
                });
            };

            $scope.openOfferDetails = function(selectedOffer){
                $scope.offer = selectedOffer;
            };
        }

    ]);
