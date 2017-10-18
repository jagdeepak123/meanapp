'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Chat = mongoose.model('Chat');
  //_ = require('lodash');


/**
 * Find article by id
 */
exports.chat = function(req, res, next, id) {
  Chat.load(id, function(err, chat) {
    if (err) return next(err);
    if (!chat) return next(new Error('Failed to load chat ' + id));
    req.chat = chat;
    next();
  });
};

/**
 * Create a chat
 */
exports.create = function(req, res) {
  var chat = new Chat(req.body);
  chat.user = req.user;

  chat.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the chat'
      });
    }
    res.json(chat);

  });
};

/**
 * List of Chat
 */
exports.all = function(req, res) {
  Chat.find().sort('+created').populate('user', 'name username').exec(function(err, chats) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the chats'
      });
    }
    res.json(chats);

  });
};
