'use strict'
var exports = module.exports = {};
var moment = require('moment')
var Realm = require('realm');
var fs = require('fs');

exports.normalizeRace = function normalizeRace(realm, carrera) {
    var result = [];
    var carreras = realm.objects('HorseRace');

    const sexos = normalizedVector(distinctSex(carreras));
    const colores = normalizedVector(distinctColors(carreras));
    const terrenos = normalizedVector(distinctTerrain(carreras));
    const numCajones = distinctCajon(carreras).length;
    const maxEdad = Math.max.apply(Math, distinctAge(carreras));
    const pistas = normalizedVector(distinctTerrain(carreras));
    const distancias = normalizedVector(distinctDistancias(carreras));
    const maxDistancia = Math.max.apply(Math, distinctDistancias(carreras))

    var ordenCarrera = 0
    carrera.forEach(function (caballos) {
        // primero obtenemos los datos del caballo
        //console.log(caballo)
        ordenCarrera = ordenCarrera + 1
        caballos.forEach(function (caballo, posInicio) {
            var datosCaballo = realm.objects('Horse').filtered('id = $0', caballo.caballoid)
            var fechaCarrera = moment(caballo.id.split('_')[1], "DD-MM-YYYY")
            if (datosCaballo.length > 0) {
                var nacimiento = moment(datosCaballo[0].nacimiento)
                //console.log(premios)
                var edad = (fechaCarrera.year() - nacimiento.year()) / 10
            } else {
                var edad = caballo.edad / 10
            }
            if (edad > 1) {
                edad = 1
            }
            var premios = caballo.premios
            //console.log(premios)

            let totalCarreras = realm.objects('HorseRace').filtered('caballoid = $0', caballo.caballoid).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasGanadas = realm.objects('HorseRace').filtered('caballoid = $0 AND posicion = 1', caballo.caballoid).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasColocado = realm.objects('HorseRace').filtered('caballoid = $0 AND (posicion = 2 OR posicion = 3 OR posicion = 4)', caballo.caballoid).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let totalCarrerasJockey = realm.objects('HorseRace').filtered('jinete.id = $0', caballo.jinete.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasGanadasJockey = realm.objects('HorseRace').filtered('jinete.id = $0 AND posicion = 1', caballo.jinete.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasColocadoJockey = realm.objects('HorseRace').filtered('jinete.id = $0 AND (posicion = 2 OR posicion = 3 OR posicion = 4)', caballo.jinete.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let totalCarrerasPreparador = realm.objects('HorseRace').filtered('preparador.id = $0', caballo.preparador.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasGanadasPreparador = realm.objects('HorseRace').filtered('preparador.id = $0 AND posicion = 1', caballo.preparador.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasColocadoPreparador = realm.objects('HorseRace').filtered('preparador.id = $0 AND (posicion = 2 OR posicion = 3 OR posicion = 4)', caballo.preparador.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let diasUltimaCarrera = totalCarreras.length > 0 ? fechaCarrera.diff(moment(totalCarreras[0].id.split('_')[1], "DD-MM-YYYY"), 'days') : 0
            let posicionPrevia1 = totalCarreras.length > 0 ? normalizaPosicion(totalCarreras[0].posicion) : 0
            let posicionPrevia2 = totalCarreras.length > 1 ? normalizaPosicion(totalCarreras[1].posicion) : 0
            let posicionPrevia3 = totalCarreras.length > 2 ? normalizaPosicion(totalCarreras[2].posicion) : 0
            let posicionPrevia4 = totalCarreras.length > 3 ? normalizaPosicion(totalCarreras[3].posicion) : 0
            let premios1 = premios.length > 0 ? normalizedPremio(premios[0]) : 0
            let premios2 = premios.length > 1 ? normalizedPremio(premios[1]) : 0
            let premios3 = premios.length > 2 ? normalizedPremio(premios[2]) : 0
            let premios4 = premios.length > 3 ? normalizedPremio(premios[3]) : 0

            var selected = {
                "participantes" : normalizaParticipantes(caballo.participantes),
                "sexo": sexos[caballo.sexo],
                "color": colores[caballo.color],
                "edad": edad,
                //"pista": pistas[caballo.pista],
                //"terreno": terrenos[caballo.terreno],
                "distancia": caballo.distancia / maxDistancia,
                "peso": caballo.peso / 100,
                "cajon": caballo.cajon / numCajones,
                "carreras": normalizedCarreras(totalCarreras.length),
                "ganadas": totalCarreras.length > 0 ? carrerasGanadas.length / totalCarreras.length : 0,
                "colocado": (totalCarreras.length > 0 ? carrerasColocado.length / totalCarreras.length : 0),
                "carrerasJockey": normalizedCarreras(totalCarrerasJockey.length),
                "ganadasJockey": (totalCarrerasJockey.length > 0 ? carrerasGanadasJockey.length / totalCarrerasJockey.length : 0),
                "colocadoJockey": (totalCarrerasJockey.length > 0 ? carrerasColocadoJockey.length / totalCarrerasJockey.length : 0),
                "carrerasPreparador": normalizedCarreras(totalCarrerasPreparador.length),
                "ganadasPreparador": (totalCarrerasPreparador.length > 0 ? carrerasGanadasPreparador.length / totalCarrerasPreparador.length : 0),
                "colocadoPreparador": (totalCarrerasPreparador.length > 0 ? carrerasColocadoPreparador.length / totalCarrerasPreparador.length : 0),
                "diasUltima": diasUltimaCarrera > 100 ? 1 : diasUltimaCarrera / 100,
                "posicionPrevia1": posicionPrevia1,
                "posicionPrevia2": posicionPrevia2,
                "posicionPrevia3": posicionPrevia3,
                "posicionPrevia4": posicionPrevia4,
                "premios1": premios1,
                "premios2": premios2,
                "premios3": premios3,
                "premios4": premios4,

            };
            var vector = [];
            for (var key in selected) {
                if (key != "posicion") {
                    vector.push(selected[key]);
                }
            }
            var trainingSet = {
                numero: posInicio + 1,
                carrera: ordenCarrera,
                cajon: caballo.cajon,
                id: caballo.id,
                input: [].concat.apply([], vector)
            }

            result.push(trainingSet);

        });
    });
    return result
}

exports.normalize = function normalize(realm) {

    var carreras = realm.objects('HorseRace');
    var result = [];

    fs.writeFile('normalized.json', '', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("NORMALIZED.JSON CREADO");
        process.exit(0);
    });
    
    const sexos = normalizedVector(distinctSex(carreras));
    const colores = normalizedVector(distinctColors(carreras));
    const terrenos = normalizedVector(distinctTerrain(carreras));
    const numCajones = distinctCajon(carreras).length;
    const maxEdad = Math.max.apply(Math, distinctAge(carreras));
    const pistas = normalizedVector(distinctTerrain(carreras));
    const maxDistancia = Math.max.apply(Math, distinctDistancias(carreras))

    carreras.forEach(function (caballo) {
        // primero obtenemos los datos del caballo
        var datosCaballo = realm.objects('Horse').filtered('id = $0', caballo.caballoid)
        if (datosCaballo.length > 0) {
            //console.log("no hay caballo "+ caballo.caballoid)
            var fechaCarrera = moment(caballo.id.split('_')[1], "DD-MM-YYYY")
            var nacimiento = moment(datosCaballo[0].nacimiento)
            var premios = caballo.premios
            //console.log(premios)
            var edad = (fechaCarrera.year() - nacimiento.year()) / 10
            if (edad > 1) {
                edad = 1
            }
            let totalCarreras = realm.objects('HorseRace').filtered('caballoid = $0', caballo.caballoid).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasGanadas = realm.objects('HorseRace').filtered('caballoid = $0 AND posicion = 1', caballo.caballoid).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })
            let carrerasColocado = realm.objects('HorseRace').filtered('caballoid = $0 AND (posicion = 2 OR posicion = 3 OR posicion = 4)', caballo.caballoid).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let totalCarrerasJockey = realm.objects('HorseRace').filtered('jinete.id = $0', caballo.jinete.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasGanadasJockey = realm.objects('HorseRace').filtered('jinete.id = $0 AND posicion = 1', caballo.jinete.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasColocadoJockey = realm.objects('HorseRace').filtered('jinete.id = $0 AND (posicion = 2 OR posicion = 3 OR posicion = 4)', caballo.jinete.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let totalCarrerasPreparador = realm.objects('HorseRace').filtered('preparador.id = $0', caballo.preparador.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasGanadasPreparador = realm.objects('HorseRace').filtered('preparador.id = $0 AND posicion = 1', caballo.preparador.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let carrerasColocadoPreparador = realm.objects('HorseRace').filtered('preparador.id = $0 AND (posicion = 2 OR posicion = 3 OR posicion = 4)', caballo.preparador.id).slice().filter(function (elem) {
                return moment(elem.id.split('_')[1], "DD-MM-YYYY").isBefore(fechaCarrera)
            }).sort(function (a, b) {
                return moment(b.id.split('_')[1], "DD-MM-YYYY").toDate() - moment(a.id.split('_')[1], "DD-MM-YYYY").toDate()
            })

            let diasUltimaCarrera = totalCarreras.length > 0 ? fechaCarrera.diff(moment(totalCarreras[0].id.split('_')[1], "DD-MM-YYYY"), 'days') : 0
            let posicionPrevia1 = totalCarreras.length > 0 ? normalizaPosicion(totalCarreras[0].posicion) : 0
            let posicionPrevia2 = totalCarreras.length > 1 ? normalizaPosicion(totalCarreras[1].posicion) : 0
            let posicionPrevia3 = totalCarreras.length > 2 ? normalizaPosicion(totalCarreras[2].posicion) : 0
            let posicionPrevia4 = totalCarreras.length > 3 ? normalizaPosicion(totalCarreras[3].posicion) : 0
            let premios1 = premios.length > 0 ? normalizedPremio(premios[0].value) : 0
            let premios2 = premios.length > 1 ? normalizedPremio(premios[1].value) : 0
            let premios3 = premios.length > 2 ? normalizedPremio(premios[2].value) : 0
            let premios4 = premios.length > 3 ? normalizedPremio(premios[3].value) : 0

            var selected = {
                "participantes" : normalizaParticipantes(caballo.participantes),
                "sexo": sexos[caballo.sexo],
                "color": colores[caballo.color],
                "edad": edad,
                //"pista": pistas[caballo.pista],
                //"terreno": terrenos[caballo.terreno],
                "distancia": caballo.distancia / maxDistancia,
                "peso": caballo.peso / 100,
                "cajon": caballo.cajon / numCajones,
                "carreras": normalizedCarreras(totalCarreras.length),
                "ganadas": totalCarreras.length > 0 ? carrerasGanadas.length / totalCarreras.length : 0,
                "colocado": (totalCarreras.length > 0 ? carrerasColocado.length / totalCarreras.length : 0),
                "carrerasJockey": normalizedCarreras(totalCarrerasJockey.length),
                "ganadasJockey": (totalCarrerasJockey.length > 0 ? carrerasGanadasJockey.length / totalCarrerasJockey.length : 0),
                "colocadoJockey": (totalCarrerasJockey.length > 0 ? carrerasColocadoJockey.length / totalCarrerasJockey.length : 0),
                "carrerasPreparador": normalizedCarreras(totalCarrerasPreparador.length),
                "ganadasPreparador": (totalCarrerasPreparador.length > 0 ? carrerasGanadasPreparador.length / totalCarrerasPreparador.length : 0),
                "colocadoPreparador": (totalCarrerasPreparador.length > 0 ? carrerasColocadoPreparador.length / totalCarrerasPreparador.length : 0),
                "diasUltima": diasUltimaCarrera > 100 ? 1 : diasUltimaCarrera / 100,
                "posicionPrevia1": posicionPrevia1,
                "posicionPrevia2": posicionPrevia2,
                "posicionPrevia3": posicionPrevia3,
                "posicionPrevia4": posicionPrevia4,
                "premios1": premios1,
                "premios2": premios2,
                "premios3": premios3,
                "premios4": premios4,
            };
            //console.log(selected)
            var vector = [];
            for (var key in selected) {
                if (key != "posicion") {
                    vector.push(selected[key]);
                }
            }
            var trainingSet = {
                input: [].concat.apply([], vector),
                output: [normalizaPosicion(caballo.posicion)]
            }
            fs.appendFileSync('normalized.json', JSON.stringify(trainingSet) + "\n")
        }
    });
    return
}

function normalizedAge(age) {
    const maxValue = 10;
    if (age > maxValue) {
        return 1;
    } else {
        return age / maxValue;
    }
}

function normalizedVictorias(victorias) {
    const maxValue = 15;
    if (victorias > maxValue) {
        return 1;
    } else {
        return victorias / maxValue;
    }
}

function normalizedCarreras(carreras) {
    const maxValue = 50;
    if (carreras > maxValue) {
        return 1;
    } else {
        return carreras / maxValue;
    }
}


function normalizedColocado(colocado) {
    const maxValue = 15;
    if (colocado > maxValue) {
        return 1;
    } else {
        return colocado / maxValue;
    }
}

function normalizaParticipantes(participantes) {
    const maxValue = 15;
    if (participantes > maxValue) {
        return 1;
    } else {
        return participantes / maxValue;
    }
}

function normalizedPremio(premio) {
    const maxValue = 10000;
    if (premio > maxValue) {
        return 1;
    } else {
        return premio / maxValue;
    }
}


function normalizedGanancias(ganancias) {
    const maxValue = 100000;
    if (ganancias > maxValue) {
        return 1;
    } else {
        return ganancias / maxValue;
    }
}

function normalizedValue(value, maxValue) {
    return value / maxValue;
}

function normalizedVector(distinct) {
    var dict = {};
    for (var i = 0; i < distinct.length; i++) {
        var vector = []
        for (var j = 0; j < distinct.length; j++) {
            if (i == j) {
                vector[j] = 1
            } else {
                vector[j] = 0
            }
        }
        dict[distinct[i]] = vector
    }
    return dict
}

function distinctAge(caballos) {
    var edades = []
    caballos.forEach(function (caballo) {
        if (edades.indexOf(caballo.edad) == -1) {
            edades.push(caballo.edad);
        }
    });
    return edades;
}

function distinctPistas(carreras) {
    var pistas = []
    carreras.forEach(function (caballo) {
        if (pistas.indexOf(caballo.pista) == -1) {
            pistas.push(caballo.pista);
        }
    });
    return pistas;
}

function distinctDistancias(carreras) {
    var distancias = []
    carreras.forEach(function (caballo) {
        if (distancias.indexOf(caballo.distancia) == -1) {
            distancias.push(caballo.distancia);
        }
    });
    return distancias;
}

function distinctColors(caballos) {
    var colores = []
    caballos.forEach(function (caballo) {
        if (colores.indexOf(caballo.color) == -1) {
            colores.push(caballo.color);
        }
    });
    return colores;
}

function distinctSex(caballos) {
    var sexo = []
    caballos.forEach(function (caballo) {
        if (sexo.indexOf(caballo.sexo) == -1) {
            sexo.push(caballo.sexo);
        }
    });
    return sexo;
}

function distinctTerrain(caballos) {
    var terrenos = []
    caballos.forEach(function (caballo) {
        if (terrenos.indexOf(caballo.terreno) == -1) {
            terrenos.push(caballo.terreno);
        }
    });
    return terrenos;
}

function distinctCajon(caballos) {
    var cajones = []
    caballos.forEach(function (caballo) {
        if (cajones.indexOf(caballo.cajon) == -1) {
            cajones.push(caballo.cajon);
        }
    });
    return cajones;
}

function normalizaPosicion(posicion) {
    switch (posicion) {
        case 1:
            return 1;
        case 2:
            return 0.5;
        case 3:
            return 0.25;
        case 4:
            return 0.15;
        default:
            return 0;
    }
}