'use strict';

var Realm = require('realm');
var fs = require('fs');
var races = require("./racesScrapper.js");
var normalizer = require("./normalizer.js");
var realmSchema = require("./realmSchema.js");
var synaptic = require('synaptic');
var trained = require('./trained.js')
var fs = require('fs');

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
var myPerceptron = new synaptic.Architect.Perceptron(numParametros, numParametros , 10,  1);
var trainingOptions = {
    rate: [.1, .01],
    iterations: 1000,
    log: 1,
    error: .05,
    shuffle: true,
    cost: synaptic.Trainer.cost.MSE
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