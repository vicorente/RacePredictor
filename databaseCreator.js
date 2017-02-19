'use strict';
var request = require('request');
var cheerio = require('cheerio');
var Realm = require('realm');
var Datejs = require('datejs');
var racesScrapper = require('./racesScrapper');
var promise = require('promise');
var mainURL = "http://www.agalopar.com/agt";
var realmSchema = require("./realmSchema.js");

var searchURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Dos%20Hermanas&Fecha=";
var zarzuelaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=La%20Zarzuela&Fecha=";
var vilasecaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Vila-Seca&Fecha=";
var pinedaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Pineda&Fecha=";
var participantsURL = "http://www.agalopar.com/agt/resultados/resultado1foto.asp?Numero=413&Fecha=27-11-2016";
var sanSebastianURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=San%20Sebasti%E1n&Fecha=";
var loredoURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Loredo&Fecha="
var sanlucarURL ="http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Sanl%FAcar%20de%20Barrameda&Fecha="
var mijasURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Mijas&Fecha="
var antelaURL = "http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Antela&Fecha="
let realm = new Realm({
  schema: [realmSchema.PremioSchema,realmSchema.HorseSchema,realmSchema.HorseRaceSchema, realmSchema.SementalSchema, realmSchema.YeguaSchema, realmSchema.JineteSchema, realmSchema.PreparadorSchema, realmSchema.PreviaSchema]
});

var start = Date.parse("2009-01-01");
//var start = Date.parse("2016-08-12");
var end = Date.parse("2017-02-19");

var horses = realm.objects('HorseRace')
console.log(horses.length)

/*racesScrapper.getPreviousHorseRaces("http://www.agalopar.com/agt/bd/fichacaballocompleta.asp?id=12389").then(function (result){
    console.log(result)
    process.exit(0)
})*/

/*racesScrapper.getEventRaces("http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Dos%20Hermanas&Fecha=14-02-2016")
.then (function (result, error){
    console.log(result)
})*/

/*racesScrapper.saveRace("http://www.agalopar.com/agt/carreras/resultado.asp?Hipodromo=Dos%20Hermanas&Fecha=14-02-2016").then(function(result,error){
    if (error) {
        console.log(error)
    }
    process.exit(0)
})*/

racesScrapper.sequentialScrapper(mijasURL, start, end).then(function(result, error){
    if (error) {
        console.log(error)
    }
    process.exit(0)
})

/*function getPage(url) {
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html, {
                ignoreWhitespace: true
            });
            console.log($.html());
        } else {
            console.log("Ha ocurrido un error al obtener la web: " + error);
        }
    });
}*/