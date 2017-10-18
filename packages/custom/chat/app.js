'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Chat = new Module('chat');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Chat.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Chat.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Chat.menus.add({
    title: 'chat example page',
    link: 'chat example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Chat.aggregateAsset('css', 'chat.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Chat.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Chat.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Chat.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Chat;
});
