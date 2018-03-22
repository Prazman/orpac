var Mandate = require('../models/mandats');

// Display list of all Mandates.
exports.mandate_list = function(req, res, next) {
    Mandate.find({})
        .exec(function(err, list_mandates) {
            if (err) { return next(err); }
            //Successful, so render
            //group all the mandates by nomenclature into a map object of structure {"nomenclature_code1":[mandate1,mandate2,..],"nomenclature_code2":[mandate3,mandate4,..],..}
            let grouped = groupBy(list_mandates, mandate => mandate.nomenclature_code);
            let mandate_list = [];
            grouped.forEach(function(element, index, map) {
                //calculate total amount summing array of mandate on ttc_amount key
                let total_amount = sumOnKey(element, 'ttc_amount');

                for (var mandate of element) {
                    let treshold = getTreshold(mandate.procedure_type,mandate.service_type);
                    console.log('mandate',mandate);
                    console.log('treshold',treshold);
                    //juridicaly covered = total amouhnt does not exceed 30000 or mandate has a market number
                    mandate.juridic_safety = (total_amount < treshold || mandate.market_coverture);
                    mandate_list.push(mandate);
                }


            })
            //console.log(list_mandates);
            //console.log(list_mandates);
            res.render('mandate_list', { title: 'Mandate List', mandate_list: mandate_list });
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
        procedure_type:req.body.procedure_type,
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

// Handle Mandate update on POST.
exports.mandate_update_post = function(req, res) {
    var mandate = new Mandate({
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

function getTreshold(procedure_type,service_type){

    switch(procedure_type){
        case 'NONE':
        return 30000;
        break;
        case 'MAPLEG':
        return 108000;
        break;
        case 'MAPLOU':
        if(service_type=='Travaux'){
            return 6657600;
        }
        else{
            return 265600;
        }
        break;
        case 'MAPLOU':
        if(service_type=='Travaux'){
            return 6657600;
        }
        else{
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