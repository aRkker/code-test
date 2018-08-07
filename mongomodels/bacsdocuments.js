'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var bacsdocuments = new Schema({
  BACSDocument: {
      type: Object,
      required: 'Need to give document'
  }
});

module.exports = mongoose.model('bacsdocuments', bacsdocuments);