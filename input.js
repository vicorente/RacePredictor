'use strict';
var request = require('request');
var cheerio = require('cheerio');
var Realm = require('realm');
var Datejs = require('datejs');
var races = require("./racesScrapper.js");
var trained = require('./trained.js')
var normalizer = require("./normalizer.js");
var Realm = require('realm');
var realmSchema = require("./realmSchema.js");

const url = "http://www.agalopar.com/agt/carreras/carreras.asp?Hipodromo=Dos%20Hermanas&Fecha=26-02-2017";

let realm = new Realm({
  schema: [realmSchema.PremioSchema, realmSchema.HorseSchema, realmSchema.HorseRaceSchema, realmSchema.SementalSchema, realmSchema.YeguaSchema, realmSchema.JineteSchema, realmSchema.PreparadorSchema, realmSchema.PreviaSchema]
})

races.getInputRace(url, function(carreras) {
  //console.log(carreras)
  var inputs = normalizer.normalizeRace(realm, carreras);
  //console.log(inputs)
  var races = [];
  inputs.forEach(function(caballo) {
    var caballoCarrera = {}
    caballoCarrera.numero = caballo.numero
    caballoCarrera.carrera = caballo.carrera
    caballoCarrera.cajon = caballo.cajon
    caballoCarrera.id = caballo.id
    caballoCarrera.output = trained.trained(caballo.input)
    races.push(caballoCarrera)
  })
  races.sort(function(a, b) {
    return a.output - b.output
  })
  
  for(var i = 1 ; i <= 5; i++) {
    console.log("-------------------------------------------- CARRERA " + i +" --------------------------------------------")
    var race = races.filter(function(elem){
      return elem.carrera == i
    })
    race.forEach(function(caballo, i){
      console.log("# " + caballo.numero + " - POSICIÓN: " + (i + 1) + " - " + caballo.id + " - " + " CAJÓN: " + caballo.cajon + " - " + "PROBABILIDAD: " + (1.0 - caballo.output)) 
    })
  }
  
  process.exit(0);
});
