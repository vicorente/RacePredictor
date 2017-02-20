'use strict';
var Realm = require('realm');
var normalizer = require("./normalizer.js");
var realmSchema = require("./realmSchema.js");
var fs = require('fs');

let realm = new Realm({
    schema: [realmSchema.PremioSchema, realmSchema.HorseSchema, realmSchema.HorseRaceSchema, realmSchema.SementalSchema, realmSchema.YeguaSchema, realmSchema.JineteSchema, realmSchema.PreparadorSchema, realmSchema.PreviaSchema]
});


console.log("normalizando...")
/*if (fs.existsSync('normalized.json')) {
    // Do something
}*/
const matriz = normalizer.normalize(realm);
process.exit(0)