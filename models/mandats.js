var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MandateSchema = new Schema(
  {
    market_number: {type: String, required: false, max: 100},
    procedure_type:{type:String,required:true, enum: ['NONE','MAPLEG','MAPLOU','APPEL_OFFRE']},
    ttc_amount: {type: Number, required: true, min: 0},
    market_object:{type:String,required:false,max:100},
    nomenclature_code:{type:String,required:true,max:100},
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

MandateSchema.methods.isJuridicallySecured = function(total_amount) {
    let treshold = this.getTreshold();

    //juridicaly covered = total amouhnt does not exceed 30000 or mandate has a market number
    return (total_amount < treshold);
}
MandateSchema.methods.getTreshold = function() {

    switch (this.procedure_type) {
        case 'NONE':
            return 30000;
            break;
        case 'MAPLEG':
            return 108000;
            break;
        case 'MAPLOU':
            if (this.service_type == 'Travaux') {
                return 6657600;
            } else {
                return 265600;
            }
            break;
        case 'MAPLOU':
            if (this.service_type == 'Travaux') {
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

//Export model
module.exports = mongoose.model('Mandate', MandateSchema);