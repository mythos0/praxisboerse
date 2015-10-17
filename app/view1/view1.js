'use strict';
var user='';
var pw='';
angular.module('myApp.view1', ['ngRoute','base64'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])
.config(['$httpProvider',function($httpProvider) {
// Cross-Domain-Aufrufe erlauben
      $httpProvider.defaults.useXDomain = true;
// Das Mitsenden von Authentifizierungsinformationen erlauben
      $httpProvider.defaults.withCredentials = true;
}])

.controller('View1Ctrl',['$scope','$log','$http','$base64', function($scope,$log,$http,$base64) {
        var root = 'http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST';
        $scope.loginInvalid = false;
        $scope.formMaster = {};
        $scope.reset = function() {
            $scope.user = angular.copy($scope.formMaster);
        };
        $scope.login = function(){
            if($scope.loginForm.username.$invalid||$scope.loginForm.password.$invalid){
                $scope.loginInvalid = true;
                $scope.reset();
            } else {
                //das hier l�uft noch nicht. Es m�sste eigentlich erst hier�ber �berpr�ft werden
                //ob die nutzerdaten stimmen und danach kommt der request nach dem verschl�ss. pw
                /*var url = root +'/credential/check/'+$base64.encode($scope.user.name)+'/'+$base64.encode($scope.user.password);
                $http({method:'GET',url:url}).then(function(data) {
                    $log.log(data);
                });*/

                $http.defaults.headers.common.Authorization = "Basic " + $base64.encode($scope.user.name + ":" + $scope.user.password);
                var url = root +'/credential/encryptedpassword'; //gibt verschl�sseltes pw wieder
                $http({method:'GET',url:url,headers:{'Accept': 'text/plain'}}).then(function(data) {
                    $log.log(data);
                    if(data.data.length==0){ //bisher noch nicht funktional
                        $scope.loginInvalid = true;
                        $scope.reset();
                    } else {
                        user = $scope.user.name;
                        pw = data.data;
                        location.href = '#/view2';
                    }
                });
            }
        };
        $scope.reset();
}]);