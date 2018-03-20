var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MandateSchema = new Schema(
  {
    market_number: {type: String, required: false, max: 100},
    ttc_amount: {type: Number, required: true, min: 0},
    market_object:{type:String,required:false,max:100},
    nomenclature_code:{type:String,required:false,max:100},
    service_type:{type: String, required: true, enum: ['Travaux','Fournitures','Service']},
    service_provider:{type:String,required:false,max:100},
    managing_service:{type:String,required:false,max:100},
  }
);
MandateSchema
    .virtual('url')
    .get(function() {
        return '/mandate/' + this._id;
    });

MandateSchema
    .virtual('market_coverture')
    .get(function() {
        return this.market_number !=='';
    });

MandateSchema
    .virtual('juridic_safety')
    .get(function() {
        mongoose.model('Mandate', MandateSchema)
        .find({'nomenclature_code':this.nomenclature_code})
        .exec(function(err, list_mandates) {
            //console.log(list_mandates);
            var total = 0;
            for(var i=0;i<list_mandates.length;i++){
                total+= list_mandates[i].ttc_amount;
            }
            console.log("other mandates",list_mandates.length);
            console.log("total",total);
            return false;//(total<30000 || this.market_coverture);
        })
        return true;
    });


//Export model
module.exports = mongoose.model('Mandate', MandateSchema);