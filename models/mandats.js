var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MandateSchema = new Schema(
  {
    market_number: {type: String, required: false, max: 100},
    procedure_type:{type:String,required:true, enum: ['NONE','MAPLEG','MAPLOU','APPEL_OFFRE']},
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



//Export model
module.exports = mongoose.model('Mandate', MandateSchema);