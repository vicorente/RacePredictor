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

const url = "http://www.agalopar.com/agt/carreras/carreras.asp?Hipodromo=Dos%20Hermanas&Fecha=19-02-2017";

let realm = new Realm({
    schema: [realmSchema.PremioSchema,realmSchema.HorseSchema, realmSchema.HorseRaceSchema, realmSchema.SementalSchema, realmSchema.YeguaSchema, realmSchema.JineteSchema, realmSchema.PreparadorSchema, realmSchema.PreviaSchema]
})

races.getInputRace(url, function(carreras) {
  //console.log(carreras)
  var inputs = normalizer.normalizeRace(realm, carreras);
  //console.log(inputs)
  var carrera = 1;
  var order = 1;
  
  inputs.forEach(function (caballo) {
    if (caballo.carrera != carrera) {
      carrera = caballo.carrera;
      console.log("--------------- CARRERA " + carrera + " ---------------");
      order = 1;
    }
    console.log("Nº: " + order + " - CAJÓN: " + caballo.cajon + " - NOMBRE: " + caballo.id + " " +
      trained.trained(caballo.input));
    order = order + 1;
  })
  process.exit(0);
});