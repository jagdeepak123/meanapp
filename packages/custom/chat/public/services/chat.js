'use strict';

angular.module('mean.chat').factory('Chat', ['$resource',
  function($resource) {
    return $resource('chat/:chatId', {
      chatId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
