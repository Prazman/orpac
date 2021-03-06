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



function mandateCreate(market_number, procedure_type, ttc_amount, market_object, nomenclature_code, service_type, service_provider, managing_service) {
    var unspaced_amount = ttc_amount.replace(/\s/g, '');
    var digital_amount = parseInt(unspaced_amount);
    var mandate_detail = {
        procedure_type: procedure_type,
        market_number: market_number,
        ttc_amount: digital_amount,
        market_object: market_object,
        nomenclature_code: nomenclature_code,
        service_type: service_type,
        service_provider: service_provider,
        managing_service: managing_service
    }
    console.log(mandate_detail);
    var mandate = new Mandate(mandate_detail);

    mandate.save(function(err) {
        if (err) {
            console.log(err);
            return
        }
        console.log('New Mandate: ' + mandate);

    });
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
        let procedure_type = getProcedureType(mandate_data[1]);
        console.log('procedure_name',mandate_data[1]);
        console.log('procedure_type',procedure_type);
        mandateCreate(mandate_data[0], procedure_type, mandate_data[2], mandate_data[3], mandate_data[4], mandate_data[5], mandate_data[6], mandate_data[7], mandate_data[8]);

    })
}

function getProcedureType(procedure_name) {
    switch (procedure_name) {
        case 'Appel d\'offres':
            return 'APPEL_OFFRE';
            break;
        case 'MAPA léger':
            return 'MAPLEG';
            break;
        case 'MAPA allourdi':
            return 'MAPLOU';
            break;
        default:
            return 'NONE';
    }
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