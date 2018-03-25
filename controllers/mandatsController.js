var Mandate = require('../models/mandats');

// Display list of all Mandates.
exports.mandate_list = function(req, res, next) {
var query = buildSearchQuery(req.query);



    console.log('search',query);
    console.log('query',req.query)
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
            var managing_service_list = [];
            var service_provider_list = [];
            grouped.forEach(function(element, index, map) {
                //calculate total amount summing array of mandate on ttc_amount key
                let total_amount = sumOnKey(element, 'ttc_amount');
                let mandate_group = {
                    nomenclature_code:element[0].nomenclature_code,
                    mandate_list:[],
                    total_amount:total_amount
                }
                for (var mandate of element) {

                    mandate.juridic_safety = isJuridicallySecured(mandate, total_amount);
                    if (mandate.market_coverture) {
                        market_coverture_count++;
                        market_coverture_amount += mandate.ttc_amount;
                    } else {
                        non_market_coverture_amount += mandate.ttc_amount;
                    }
                    if (mandate.juridic_safety) {
                        juridic_safety_count++;
                    }

                    mandate_group.mandate_list.push(mandate);

                    if(service_provider_list.indexOf(mandate.service_provider)==-1) service_provider_list.push(mandate.service_provider);
                    if(managing_service_list.indexOf(mandate.managing_service)==-1) managing_service_list.push(mandate.managing_service);
                    //console.log(mandate_group.mandate_list);
                }
                mandate_array.push(mandate_group);


            })

            var formdata = {
                managing_service_list:managing_service_list,
                service_provider_list:service_provider_list
            }
            var non_market_coverture_count = list_mandates.length-market_coverture_count;
            var non_juridic_safety_count = list_mandates.length-juridic_safety_count;
            var stats = {
                market_coverture_count_data: [market_coverture_count, non_market_coverture_count],
                market_coverture_amount_data: [market_coverture_amount, non_market_coverture_amount],
                juridic_safety_count_data: [juridic_safety_count, non_juridic_safety_count]
            }
            //console.log(mandate_array)
            var stat_json_string = JSON.stringify(stats);

            res.render('mandate_list', { title: 'Mandate List', mandate_list: mandate_array,charts_data:stat_json_string ,formdata :formdata});
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

// Display Mandate update form on GET.
exports.mandate_update_get = function(req, res) {
    Mandate.findById(req.params.id)
        .exec(function(err, mandate_result) {
            res.render('mandate_form', { title: 'Mandate Details', mandate: mandate_result });
        });
};

// Display Mandate update form on GET.
exports.graph = function(req, res) {
    res.render('graph', { title: 'Graph' });

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
        console.log('test', themandate);
        res.redirect('/');
    });
};

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

function isJuridicallySecured(mandate, total_amount) {
    let treshold = getTreshold(mandate.procedure_type, mandate.service_type);

    //juridicaly covered = total amouhnt does not exceed 30000 or mandate has a market number
    return (total_amount < treshold);
}

function getTreshold(procedure_type, service_type) {

    switch (procedure_type) {
        case 'NONE':
            return 30000;
            break;
        case 'MAPLEG':
            return 108000;
            break;
        case 'MAPLOU':
            if (service_type == 'Travaux') {
                return 6657600;
            } else {
                return 265600;
            }
            break;
        case 'MAPLOU':
            if (service_type == 'Travaux') {
                return 6657600;
            } else {
                return 265600;
            }
            break;
        case 'APPEL_OFFRE':
            return 10000000000000000;
            break;
        default:
            break;

    }
}

function buildSearchQuery(query){
    let search_object = {};
    if(query.procedure_type && query.procedure_type!==''){
        search_object.procedure_type = query.procedure_type;
    }
    if(query.market_number && query.market_number!==''){
        search_object.market_number = query.market_number;
    }
    if(query.ttc_amount && query.ttc_amount!==''){
        search_object.ttc_amount = parseInt(query.ttc_amount);
    }
    if(query.market_object && query.market_object!==''){
        search_object.market_object = new RegExp(query.market_object, "i");
    }
    if(query.nomenclature_code && query.nomenclature_code!==''){
        search_object.nomenclature_code = new RegExp(query.nomenclature_code, "i");
    }
    if(query.service_type && query.service_type!==''){
        search_object.service_type = query.service_type;
    }
    if(query.service_provider && query.service_provider!==''){
        search_object.service_provider = query.service_provider;
    }
    if(query.managing_service && query.managing_service!==''){
        search_object.managing_service = query.managing_service;
    }
    return search_object;
}