var Mandate = require('../models/mandats');

// Display list of all Mandates.
exports.mandate_list = function(req, res, next) {
    var query = buildSearchQuery(req.query);
    console.log('query', query);
    Mandate.find(query)
        .exec(function(err, list_mandates) {
            if (err) { return next(err); }
            //Successful, so render
            //group all the mandates by nomenclature into a map object of structure {"nomenclature_code1":[mandate1,mandate2,..],"nomenclature_code2":[mandate3,mandate4,..],..}
            let grouped = groupBy(list_mandates, mandate => mandate.nomenclature_code);
            let mandate_array = [];
            let market_coverture_count = 0;
            let market_coverture_amount = 0;
            let non_market_coverture_amount = 0;
            let juridic_safety_count = 0;
            let juridic_safety_amount = 0
            let non_juridic_safety_amount = 0;
            var managing_service_list = [];
            var service_provider_list = [];
            let mandate_list;
            grouped.forEach(function(element, index, map) {
                //calculate total amount summing array of mandate on ttc_amount key
                mandate_list = [];
                let total_amount = sumOnKey(element, 'ttc_amount');


                for (var mandate of element) {

                    mandate.juridic_safety = mandate.isJuridicallySecured(total_amount);
                    let donotpush = (req.query.juridic_safety && ((req.query.juridic_safety == 'true' && !mandate.juridic_safety) || (req.query.juridic_safety == 'false' && mandate.juridic_safety)))
                    if (!donotpush) {
                        if (mandate.market_coverture) {
                            market_coverture_count++;
                            market_coverture_amount += mandate.ttc_amount;
                        } else {
                            non_market_coverture_amount += mandate.ttc_amount;
                        }
                        if (mandate.juridic_safety) {
                            juridic_safety_count++;
                            juridic_safety_amount += mandate.ttc_amount;
                        } else {
                            non_juridic_safety_amount += mandate.ttc_amount;
                        }

                        mandate_list.push(mandate);

                        if (service_provider_list.indexOf(mandate.service_provider) == -1) service_provider_list.push(mandate.service_provider);
                        if (managing_service_list.indexOf(mandate.managing_service) == -1) managing_service_list.push(mandate.managing_service);

                    }

                }
                if(mandate_list.length>0){
                    let mandate_group = {
                    nomenclature_code: element[0].nomenclature_code,
                    mandate_list: mandate_list,
                    total_amount: precisionRound(total_amount, 2)
                }
                mandate_array.push(mandate_group);
                }
                


            })

            var formdata = {
                managing_service_list: managing_service_list,
                service_provider_list: service_provider_list
            }
            var non_market_coverture_count = list_mandates.length - market_coverture_count;
            var non_juridic_safety_count = list_mandates.length - juridic_safety_count;
            var stats = {
                market_coverture_count_data: [market_coverture_count, non_market_coverture_count],
                market_coverture_amount_data: [precisionRound(market_coverture_amount, 2), precisionRound(non_market_coverture_amount, 2)],
                juridic_safety_count_data: [juridic_safety_count, non_juridic_safety_count],
                juridic_safety_amount_data: [precisionRound(juridic_safety_amount, 2), precisionRound(non_juridic_safety_amount, 2)]
            }
            var stat_json_string = JSON.stringify(stats);

            res.render('mandate_list', { title: 'Mandate List', mandate_list: mandate_array, charts_data: stat_json_string, formdata: formdata });
        });
};

// Display detail page for a specific Mandate.
exports.mandate_detail = function(req, res) {
    Mandate.findById(req.params.id)
        .exec(function(err, mandate_result) {
            res.render('mandate_detail', { title: 'Mandate Details', mandate: mandate_result });
        });
};

// Display Mandate create form on GET.
exports.mandate_create_get = function(req, res) {
    res.render('mandate_form', { title: 'Create Mandate' });
};

// Handle Mandate create on POST.
exports.mandate_create_post = (req, res, next) => {
    var mandate_detail = {
        procedure_type: req.body.procedure_type,
        market_number: req.body.market_number,
        ttc_amount: req.body.ttc_amount,
        market_object: req.body.market_object,
        nomenclature_code: req.body.nomenclature_code,
        service_type: req.body.service_type,
        service_provider: req.body.service_provider,
        managing_service: req.body.managing_service
    }
    var mandate = new Mandate(mandate_detail);
    // Create a genre object with escaped and trimmed data.


    mandate.save(function(err) {
        if (err) { return next(err); }
        // Genre saved. Redirect to genre detail page.
        res.redirect('/');
    });



};

// Display Mandate delete form on GET.
exports.mandate_delete_get = function(req, res) {
    Mandate.findById(req.params.id).exec(function(err, mandate_result) {
        res.render('mandate_delete', { title: 'Mandate Deletion', mandate: mandate_result });

    });
};

// Handle Mandate delete on POST.
exports.mandate_delete_post = function(req, res) {
    Mandate.findByIdAndRemove(req.body.mandateid, function deleteGenre(err) {
        if (err) { return next(err); }
        //Success - got to author list
        res.redirect('/');
    });
};

exports.mandate_deleteall_get = function(req, res) {

    res.render('mandate_deleteall', { title: 'Mandate Deletion' });

};

// Handle Mandate delete on POST.
exports.mandate_deleteall_post = function(req, res) {

    Mandate.remove({}, function() {
        res.redirect('/');
    })
};

// Display Mandate update form on GET.
exports.mandate_update_get = function(req, res) {
    Mandate.findById(req.params.id)
        .exec(function(err, mandate_result) {
            res.render('mandate_form', { title: 'Mandate Details', mandate: mandate_result });
        });
};



// Handle Mandate update on POST.
exports.mandate_update_post = function(req, res) {
    var mandate = new Mandate({
        procedure_type: req.body.procedure_type,
        market_number: req.body.market_number,
        ttc_amount: req.body.ttc_amount,
        market_object: req.body.market_object,
        nomenclature_code: req.body.nomenclature_code,
        service_type: req.body.service_type,
        service_provider: req.body.service_provider,
        managing_service: req.body.managing_service,
        _id: req.params.id
    });

    Mandate.findByIdAndUpdate(req.params.id, mandate, {}, function(err, themandate) {
        if (err) {
            console.log(err);
            return next(err);
        }
        //successful - redirect to book detail page.

        res.redirect('/');
    });
};

exports.mandate_import_get = function(req, res) {
    res.render('mandate_import', { title: 'Mandate Import' });
}

exports.mandate_import_post = function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;
    var target_path = './temp/' + file.name
    file.mv(target_path, function(err) {
        if (err)
            return res.status(500).send(err);
        var csv = require('csv-parser')
        var fs = require('fs')
        var stream = csv({
            raw: false, // do not decode to utf-8 strings
            separator: ',', // specify optional cell separator
            quote: '"', // specify optional quote character
            escape: '"', // specify optional escape character (defaults to quote value)
            newline: '\n', // specify a newline character
            headers: ['market_number', 'procedure_type', 'ttc_amount', 'market_object', 'nomenclature_code', 'service_type', 'service_provider', 'managing_service'] // Specifing the headers
        })
        var readStream = fs.createReadStream(target_path);
        var errcount = 0;
        var errors = [];
        var donecount = 0;
        readStream.pipe(stream).on('data', function(mandate) {

            mandate.ttc_amount = parseAmount(mandate.ttc_amount);
            mandate.procedure_type = getProcedureType(mandate.procedure_type);
            var mandate = new Mandate(mandate);
            // Create a genre object with escaped and trimmed data.


            mandate.save(function(err) {
                if (err) {

                    errcount++;
                    errors.push(err);
                } else {

                    donecount++;
                }


            });

        })

        readStream.on('end', function() {

            let report = {
                donecount: donecount,
                errorcount: errcount,
                errors: errors
            }

            res.render('mandate_import', { title: 'Mandate Import', report: report });
        });
    });
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

function sumOnKey(array, key) {
    var total = 0;
    for (var object of array) {
        total += object[key];
    }
    return total;
}

function parseAmount(ttc_amount) {
    //remove euro symbol
    var amount = ttc_amount.replace(/\u20ac/g, '');
    //remove white space
    amount = amount.replace(/,/g, '.');
    amount = amount.replace(/\s/g, '');
    amount = parseFloat(amount);
    return amount;
}

function getProcedureType(procedure_name) {
    switch (procedure_name) {
        case 'Appel d\'offres':
        case 'Appel d\'offre':
            return 'APPEL_OFFRE';
            break;
        case 'MAPA léger':
            return 'MAPLEG';
            break;
        case 'MAPA allourdi':
        case 'MAPA lourd':
            return 'MAPLOU';
            break;
        default:
            return 'NONE';
    }
}

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function buildSearchQuery(query) {
    let search_object = {};
    if (query.procedure_type && query.procedure_type !== '') {
        search_object.procedure_type = query.procedure_type;
    }
    if (query.market_number && query.market_number !== '') {
        search_object.market_number = query.market_number;
    }
    if (query.market_coverture) {
        if (query.market_coverture == 'true') {
            search_object.market_number = { $ne: '' };
        } else if (query.market_coverture == 'false') {
            search_object.market_number = '';
        }
    }
    if (query.ttc_amount && query.ttc_amount !== '') {
        search_object.ttc_amount = parseInt(query.ttc_amount);
    }

    if (query.market_object && query.market_object !== '') {
        search_object.market_object = new RegExp(query.market_object, "i");
    }
    if (query.nomenclature_code && query.nomenclature_code !== '') {
        search_object.nomenclature_code = new RegExp(query.nomenclature_code, "i");
    }
    if (query.service_type && query.service_type !== '') {
        search_object.service_type = query.service_type;
    }
    if (query.service_provider && query.service_provider !== '') {
        search_object.service_provider = query.service_provider;
    }
    if (query.managing_service && query.managing_service !== '') {
        search_object.managing_service = query.managing_service;
    }

    return search_object;
}