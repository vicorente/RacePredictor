'use strict';
var request = require('request');
var cheerio = require('cheerio');
var Realm = require('realm');
var fs = require('fs');
var races = require("./racesScrapper.js");
var normalizer = require("./normalizer.js");
var realmSchema = require("./realmSchema.js");
var synaptic = require('synaptic');
var trained = require('./trained.js')
var mainURL = "http://www.agalopar.com/agt";
var fs = require('fs');
var searchURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Dos%20Hermanas&Fecha=";
var zarzuelaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=La%20Zarzuela&Fecha=";
var vilasecaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Vila-Seca&Fecha=";
var pinedaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Pineda&Fecha=";
var sanSebastianURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=San%20Sebasti%E1n&Fecha=";
var loredoURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Loredo&Fecha="
var sanlucarURL ="http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Sanl%FAcar%20de%20Barrameda&Fecha="

let realm = new Realm({
    schema: [realmSchema.PremioSchema, realmSchema.HorseSchema, realmSchema.HorseRaceSchema, realmSchema.SementalSchema, realmSchema.YeguaSchema, realmSchema.JineteSchema, realmSchema.PreparadorSchema, realmSchema.PreviaSchema]
});

console.log("leyendo de normalized.json ...")
var trainingSet = []
fs.readFileSync('normalized.json').toString().split('\n').forEach(function (line) {
    try {
        trainingSet.push(JSON.parse(line))
    } catch(error) {
        console.log(error)
    }    
})
var numParametros = trainingSet[0].input.length;
console.log("entrenando...")
var myPerceptron = new synaptic.Architect.Perceptron(numParametros, 30, 30, 30, 1);
var trainingOptions = {
    rate: .05,
    iterations: 100000,
    log: 100,
    error: .005,
    cost: synaptic.Trainer.cost.CROSS_ENTROPY
}

var myTrainer = new synaptic.Trainer(myPerceptron);
myTrainer.train(trainingSet, trainingOptions);
fs.writeFile("function.js", myPerceptron.standalone().toLocaleString(), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("Se ha creado el fichero function.js");
    process.exit(0);
});