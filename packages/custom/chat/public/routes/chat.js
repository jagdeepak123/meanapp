'use strict';

angular.module('mean.chat').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('chat example page', {
      url: '/chat/example',
      templateUrl: 'chat/views/index.html'
    });
  }
]);
