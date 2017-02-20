/* Realiza peticiones para leer los datos de las paginas web*/
'use strict';

var request = require('request');
var cheerio = require('cheerio');
var Realm = require('realm');
var promise = require('promise');
var realmSchema = require("./realmSchema.js");
var moment = require('moment');
var mainURL = "http://www.agalopar.com/agt";

let realm = new Realm({
    schema: [realmSchema.PremioSchema, realmSchema.HorseSchema, realmSchema.HorseRaceSchema, realmSchema.SementalSchema, realmSchema.YeguaSchema, realmSchema.JineteSchema, realmSchema.PreparadorSchema, realmSchema.PreviaSchema]
});


var getRaceParticipants = function getRaceParticipants(url) {
        request(url, function(error, response, html) {
            if (!error) {
                var $ = cheerio.load(html, {
                        ignoreWhitespace: true
                    }),
                    participantes = $("table.resultado3 tr");
                console.log(participantes.length - 7);
            }
            else {
                console.log("Ha ocurrido un error al obtener la web: " + error);
            }
        });
    }
    // Obtiene la carrera a introducir en la red neuronal entrenada
var getInputRace = function getInputRace(url, callBack) {
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html, {
                    ignoreWhitespace: true
                }),
                carrerasHtml = $("table tr.carreras8 td").filter(function(i, el) {
                    // obtenemos solo las tablas con estos colores
                    return $(this).attr('bgcolor') == '#1F4204';
                }),
                distancia = $("td.carreras9").filter(function(i, el) {
                    return $(el).attr('bgcolor') == '#1F4204' && $(el).attr('colspan') == '2'
                }),

                premios = $("tr.carreras7 td.carreras8").filter(function(i, el) {
                    return $(el).attr('width') == '100%' && $(el).attr('align') == 'center'
                });

            var carreras = [];
            var premiosCarrera = []
            premios.each(function(i, el) {
                premiosCarrera[i] = premios.eq(i).text().split('-').map(function(element) {
                    return parseInt(element.trim().replace(/[^0-9]+/g, ""))
                })
            })
            carrerasHtml.each(function(i, element) {
                // con parent().parent() obtenemos la tabla de la carrera
                var caballos = $(element).parent().parent().find("td.carreras7");

                var caballosCarrera = [];
                caballos.each(function(j, element) {
                    var caballo = {};
                    var campo = $(this).parent().find("table tr td.carreras11");

                    try {
                        caballo["id"] = campo.find("a").eq(0).text().trim() + "_" + getParam("Fecha", url);
                        caballo["url"] = campo.find("a").eq(0).attr('href').substring(2);
                        caballo["caballoid"] = parseInt(getParam("id", caballo.url))
                        caballo["distancia"] = parseInt(distancia.eq(i).text().split(' ')[1])
                        caballo["pista"] = distancia.eq(i).text().split(' ')[3].toLowerCase()
                        var morfologia = campo.eq(1).text().trim().split(' ');
                        caballo["sexo"] = morfologia[0].replace(/[^a-zA-Z]+/g, "");
                        caballo["color"] = morfologia[1].trim().replace(/[^a-z]+/g, "");
                        caballo["premios"] = premiosCarrera[i]
                        var edad = 0
                        if (morfologia.length > 3) {
                            caballo["color"] = caballo["color"] + morfologia[2].trim().replace(/[^a-z]+/g, "");
                            edad = morfologia[3].replace(/[^0-9]+/g, "");
                        }
                        else {
                            edad = morfologia[2].replace(/[^0-9]+/g, "");
                        }
                        caballo["edad"] = parseInt(edad);

                        caballo["ordenCarrera"] = i + 1;
                        caballo["posicion"] = j + 1;
                        var participantes = $(this).parent().parent().find("td.carreras7").filter(function(i, el) {
                            return $(this).attr('rowspan') == '2';
                        }).last().text().replace(/[^0-9]+/g, "");
                        caballo["participantes"] = parseInt(participantes);

                        //caballo["terreno"] = $(this).parent().parent().find("span.Estilo5").eq(1).text().replace('Terreno:', '').trim();

                        var padre = {};
                        padre["nombre"] = campo.find("a").eq(1).text().trim();
                        padre["url"] = campo.find("a").eq(1).eq(0).attr('href').substring(2);
                        padre["id"] = parseInt(getParam("Id", padre.url));
                        var madre = {};

                        madre["nombre"] = campo.find("a").eq(2).text().trim();
                        madre["url"] = campo.find("a").eq(2).eq(0).attr('href').substring(2);
                        madre["id"] = parseInt(getParam("Id", madre.url));

                        caballo["padre"] = padre;
                        caballo["madre"] = madre;
                        var peso = campo.eq(3).text().replace(",", ".");
                        caballo["peso"] = parseFloat(peso);

                        var jinete = {};

                        jinete["nombre"] = $(this).parent().find("table tr td.carreras10").text().trim();
                        jinete["url"] = $(this).parent().find("table tr td.carreras10 a").eq(0).attr('href').substring(2);
                        jinete["id"] = parseInt(getParam("id", jinete.url));
                        caballo["jinete"] = jinete;

                        var preparador = {};

                        preparador["nombre"] = campo.eq(5).text().trim();
                        preparador["url"] = campo.eq(5).find("a").eq(0).attr('href').substring(2);
                        preparador["id"] = parseInt(getParam("Id", preparador.url));
                        caballo["preparador"] = preparador;

                        var cajonFinal = $(this).parent().find("td.carreras11").filter(function(i, el) {
                            return $(this).attr('rowspan') == '2';
                        }).eq(1).text().trim();
                        caballo["cajon"] = parseInt(cajonFinal);
                        caballosCarrera[j] = caballo;

                    }
                    catch (err) {
                        console.log(err);
                    }

                });

                carreras[i] = caballosCarrera;
            });
            callBack(carreras);
        }
        else {
            console.log("Ha ocurrido un error al obtener las carreras del evento: " + error);
        }
    });
}

/**
 * 
 *  Obtiene las carreras previas de un caballo, especificado en la url
 * 
 **/
var getPreviousHorseRaces = function getPreviousHorseRaces(url) {
    var horseid = parseInt(getParam("id", url))
    return new Promise(function(fulfill, reject) {
        request(url, function(error, response, html) {
            if (!error) {
                try {
                    var datosCaballo = {};
                    var $ = cheerio.load(html, {
                        ignoreWhitespace: true
                    });
                    datosCaballo.id = horseid
                    datosCaballo.nacimiento = moment($("tr td.resultbd7").eq(2).text().trim(), "DD/MM/YYYY").toDate(); // dd/mm/yyyy
                    /*var carreras = []
                    $("tr.resultbd5").each(function(i, element) {
                        var datosCarrera = {}
                        var lines = $(element).find("td")
                        datosCarrera.fecha = moment($(lines).eq(0).text().trim(), "DD/MM/YYYY").toDate();
                        datosCarrera.id = datosCaballo.id.toString() + datosCarrera.fecha.toString()
                        console.log(datosCarrera.id)
                        datosCarrera.hipodromo = $(lines).eq(1).text().trim()
                        datosCarrera.url = $(lines).eq(2).find("a").attr('href').substring(2);
                        datosCarrera.distancia = parseInt($(lines).eq(3).text().trim())
                        datosCarrera.terreno = $(lines).eq(4).text().trim().toLowerCase()
                        datosCarrera.posicion = parseInt($(lines).eq(5).text().trim().replace(/[^0-9]+/g, ""))
                        datosCarrera.jinete = $(lines).eq(6).text().trim()
                        datosCarrera.peso = parseFloat($(lines).eq(7).text().trim().replace(",", "."))
                        datosCarrera.ganancias = parseInt($(lines).eq(8).text().trim().replace(/[^0-9]+/g, ""))
                        datosCarrera.estadopista = $(lines).eq(9).text().trim().toLowerCase()
                        carreras.push(datosCarrera)
                    })
                    datosCaballo.carreras = carreras*/
                    fulfill(datosCaballo)
                }
                catch (parseError) {
                    reject(parseError)
                }
            }
            else {
                reject(error)
            }
        })
    })
}

/**
 * Obtiene todas las carreras de un evento, especificado en la url
 * 
 */
var getEventRaces = function getEventRaces(url) {
    return new Promise(function(fulfill, reject) {
        request(url, function(error, response, html) {
            if (!error) {
                var $ = cheerio.load(html, {
                        ignoreWhitespace: true
                    }),
                    carrerasHtml = $("table tr.carreras8 td").filter(function(i, el) {
                        // obtenemos solo las tablas con estos colores
                        return $(this).attr('bgcolor') == '#1F4204';
                    }),
                    distancia = $("td.carreras9").filter(function(i, el) {
                        return $(el).attr('bgcolor') == '#1F4204' && $(el).attr('colspan') == '2'
                    }),

                    premios = $("tr.carreras7 td.carreras8").filter(function(i, el) {
                        return $(el).attr('width') == '100%' && $(el).attr('align') == 'center'
                    });
                var premiosCarrera = []
                premios.each(function(i, el) {
                    premiosCarrera[i] = premios.eq(i).text().split('-').map(function(element) {
                        return parseInt(element.trim().replace(/[^0-9]+/g, ""))
                    })
                })
                var carreras = [];
                carrerasHtml.each(function(i, element) {
                    // con parent().parent() obtenemos la tabla de la carrera
                    var caballos = $(element).parent().parent().find("td.carreras7");
                    var caballosCarrera = [];
                    caballos.each(function(j, element) {
                        var caballo = {};
                        var campo = $(this).parent().find("table tr td.carreras11");
                        try {
                            caballo["id"] = campo.find("a").eq(0).text().trim() + "_" + getParam("Fecha", url);
                            caballo["url"] = campo.find("a").eq(0).attr('href').substring(2);
                            caballo["caballoid"] = parseInt(getParam("id", caballo.url))
                            caballo["distancia"] = parseInt(distancia.eq(i).text().split(' ')[1])
                            caballo["pista"] = distancia.eq(i).text().split(' ')[3].toLowerCase()
                            var morfologia = campo.eq(1).text().trim().split(' ');
                            caballo["sexo"] = morfologia[0].replace(/[^a-zA-Z]+/g, "");
                            caballo["color"] = morfologia[1].trim().replace(/[^a-z]+/g, "");
                            caballo["premios"] = premiosCarrera[i]
                            var edad = 0
                            if (morfologia.length > 3) {
                                caballo["color"] = caballo["color"] + morfologia[2].trim().replace(/[^a-z]+/g, "");
                                edad = morfologia[3].replace(/[^0-9]+/g, "");
                            }
                            else {
                                edad = morfologia[2].replace(/[^0-9]+/g, "");
                            }
                            caballo["edad"] = parseInt(edad);

                            caballo["ordenCarrera"] = i + 1;
                            caballo["posicion"] = j + 1;
                            var participantes = $(this).parent().parent().find("td.carreras7").filter(function(i, el) {
                                return $(this).attr('rowspan') == '2';
                            }).last().text().replace(/[^0-9]+/g, "");
                            caballo["participantes"] = parseInt(participantes);
                            caballo["terreno"] = $(this).parent().parent().find("span.Estilo5").eq(1).text().replace('Terreno:', '').trim().toLowerCase();
                            var padre = {};
                            padre["nombre"] = campo.find("a").eq(1).text().trim();
                            padre["url"] = campo.find("a").eq(1).eq(0).attr('href').substring(2);
                            padre["id"] = parseInt(getParam("Id", padre.url));
                            var madre = {};

                            madre["nombre"] = campo.find("a").eq(2).text().trim();
                            madre["url"] = campo.find("a").eq(2).eq(0).attr('href').substring(2);
                            madre["id"] = parseInt(getParam("Id", madre.url));

                            caballo["padre"] = padre;
                            caballo["madre"] = madre;
                            var peso = campo.eq(3).text().replace(",", ".");
                            caballo["peso"] = parseFloat(peso);

                            var jinete = {};

                            jinete["nombre"] = $(this).parent().find("table tr td.carreras10").text().trim();
                            jinete["url"] = $(this).parent().find("table tr td.carreras10 a").eq(0).attr('href').substring(2);
                            jinete["id"] = parseInt(getParam("id", jinete.url));
                            caballo["jinete"] = jinete;

                            var preparador = {};

                            preparador["nombre"] = campo.eq(5).text().trim();
                            preparador["url"] = campo.eq(5).find("a").eq(0).attr('href').substring(2);
                            preparador["id"] = parseInt(getParam("Id", preparador.url));
                            caballo["preparador"] = preparador;

                            var cajonFinal = $(this).parent().find("td.carreras11").filter(function(i, el) {
                                return $(this).attr('rowspan') == '2';
                            }).eq(1).text().trim();

                            var cajon = cajonFinal.match(/\((.*)\)/)[1].replace(/[^0-9]+/g, "");
                            caballo["cajon"] = parseInt(cajon);

                            caballosCarrera[j] = caballo;
                        }
                        catch (tryerror) {
                            reject(tryerror)
                        }
                    });
                    carreras[i] = caballosCarrera;
                });
                fulfill(carreras);
            }
            else {
                reject(error)
            }
        });
    });
}
/**
 * Guarda 
 **/
var saveRace = function saveRace(carreras) {
    var promise = Promise.resolve(null)
    // busqueda asíncrona secuencial en forEach
    carreras.forEach(function(carreraCaballos) {
        carreraCaballos.forEach(function(caballoCarrera) {
            var caballo = realm.objects('Horse').filtered('id = $0', caballoCarrera.caballoid)
            if (caballo.length <= 0) {
                promise = promise.then(function() {
                    return getPreviousHorseRaces(mainURL + caballoCarrera.url)
                }).then(function(datosCaballo) {
                    if (!isNaN(datosCaballo.nacimiento)) {
                        //si el caballo existe en la BD no insertamos
                        console.log("inserting..." + datosCaballo.id)
                        try {
                            realm.write(() => {
                                let horse = realm.create('Horse', {
                                    id: datosCaballo.id,
                                    nacimiento: datosCaballo.nacimiento,
                                }, true);
                            });
                        }
                        catch (writeError) {
                            console.log(writeError)
                            console.log("Error guardar el caballo " + datosCaballo.id + " " + datosCaballo.nacimiento)
                        }
                    }
                })
            }
        })
    })
    return promise
}

var sequentialScrapper = function sequentialScrapper(searchURL, startDate, endDate) {
    if (startDate >= endDate) {
        return Promise.resolve(0)
    }
    var myURL = searchURL + startDate.toString("dd-MM-yyyy");
    console.log(myURL);
    return getEventRaces(myURL).then(function(carreras, error) {
        // Guardamos las carreras en la base de datos
        if (error) {
            return Promise.reject(error)
        }
        return new Promise(function(fulfill, reject) {
            carreras.forEach(function(carrera) {
                carrera.forEach(function(caballoCarrera) {
                    try {
                        realm.write(() => {
                            let object = realm.create('HorseRace', {
                                id: caballoCarrera.id,
                                caballoid: caballoCarrera.caballoid,
                                distancia: caballoCarrera.distancia,
                                pista: caballoCarrera.pista,
                                url: caballoCarrera.url,
                                posicion: caballoCarrera.posicion,
                                sexo: caballoCarrera.sexo,
                                color: caballoCarrera.color,
                                edad: caballoCarrera.edad,
                                ordenCarrera: caballoCarrera.ordenCarrera,
                                participantes: caballoCarrera.participantes,
                                terreno: caballoCarrera.terreno,

                                padre: {
                                    id: caballoCarrera.padre.id,
                                    nombre: caballoCarrera.padre.nombre,
                                    url: caballoCarrera.padre.url
                                },
                                madre: {
                                    id: caballoCarrera.madre.id,
                                    nombre: caballoCarrera.madre.nombre,
                                    url: caballoCarrera.madre.url
                                },
                                peso: caballoCarrera.peso,
                                jinete: {
                                    id: caballoCarrera.jinete.id,
                                    nombre: caballoCarrera.jinete.nombre,
                                    url: caballoCarrera.jinete.url
                                },
                                preparador: {
                                    id: caballoCarrera.preparador.id,
                                    nombre: caballoCarrera.preparador.nombre,
                                    url: caballoCarrera.preparador.url
                                },
                                cajon: caballoCarrera.cajon,
                            }, true);
                            caballoCarrera.premios.forEach(function(premio) {
                                object.premios.push({
                                    value: premio
                                })
                            })
                        });
                    }
                    catch (writeError) {
                        console.log('------ CaballoCarrera no guardado ------')
                    }
                });
            });
            fulfill(carreras);
        });
    }).then(function(carreras, err) {
        if (err) {
            return Promise.reject(err)
        }
        return saveRace(carreras)
    }).then(function(result, err) {
        if (err) {
            return Promise.reject(err)
        }
        return sequentialScrapper(searchURL, startDate.add(1).day(), endDate)
    }).catch(function(catched) {
        console.log(catched)
        console.log("rejected")
        return sequentialScrapper(searchURL, startDate.add(1).day(), endDate)
    })
}

// Obtiene el parametro 'param' de la url
var getParam = function getParam(param, url) {
    var vars = {};
    url.replace(url.hash, '').replace(
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function(m, key, value) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if (param) {
        return vars[param] ? vars[param] : null;
    }
    return vars;
}

module.exports = {
    getRaceParticipants: getRaceParticipants,
    getInputRace: getInputRace,
    getEventRaces: getEventRaces,
    sequentialScrapper: sequentialScrapper,
    getParam: getParam,
    getPreviousHorseRaces: getPreviousHorseRaces,
    saveRace: saveRace
};
