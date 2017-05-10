'use strict';

angular.module('chrome.plugin.trynew', [])
.controller('tryNewRootController', ['$scope', function($scope) {
    $scope.message = {
      text : ''
    };
}]);