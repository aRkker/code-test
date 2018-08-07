'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Returneditems = new Schema({
  ReturnedDebitItem: {
      type: Object,
      required: 'Need to give ReturnedDebitItem'
  }
});

module.exports = mongoose.model('returneddebititems', Returneditems);