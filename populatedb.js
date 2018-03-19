#! /usr/bin/env node

console.log('Mandates population script');

//Get arguments passed on command line

var Mandate = require('./models/mandats');

var mongoose = require('mongoose');
var mongoDB = "mongodb://localhost:27017/orpac";
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var fs = require('fs'),
    readline = require('readline');



function mandateCreate(market_number, ttc_amount,market_object, nomenclature_code, service_type, service_provider, managing_service) {
var mandate_detail = {
  market_number:market_number,
  ttc_amount:ttc_amount,
  market_object:market_object,
  nomenclature_code:nomenclature_code,
  service_type:service_type,
  service_provider:service_provider,
  managing_service:managing_service
}
console.log(mandate_detail);
     var mandate = new Mandate(mandate_detail);
       
  mandate.save(function (err) {
    if (err) {
      console.log(err);
      return
    }
    console.log('New Mandate: ' + mandate);

  }  );
}

function createMandates() {
    var rl = readline.createInterface({
        input: fs.createReadStream('./import.csv'),
        output: process.stdout,
        terminal: false
    })
    rl.on('line', function(line) {
        //console.log(line) //or parse line
        var mandate_data = line.split(',');
        console.log('market_number',mandate_data[0])
        mandateCreate(mandate_data[0],mandate_data[1],mandate_data[2],mandate_data[3],mandate_data[4],mandate_data[5],mandate_data[6],mandate_data[7]);

    })
}

createMandates();

//mongoose.connection.close();

/*async.series([
    createGenreAuthors,
    createBooks,
    createBookInstances
],
// optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+bookinstances);
        
    }
    //All done, disconnect from database
    mongoose.connection.close();
});*/