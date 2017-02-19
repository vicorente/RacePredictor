'use strict';
var exports = module.exports = {};
var Realm = require('realm');

exports.HorseSchema = {
    name: 'Horse',
    primaryKey: 'id',
    properties: {
        id: 'int',
        nacimiento: 'date',
        previas: {
            type: 'list',
            objectType: 'Previa'
        },
    }
};

exports.HorseRaceSchema = {
    name: 'HorseRace',
    primaryKey: 'id',
    properties: {
        id: 'string',
        caballoid : 'int',
        distancia: 'int',
        pista: 'string',
        url: 'string',
        posicion: 'int',
        sexo: 'string',
        color: 'string',
        edad: 'int',
        ordenCarrera: 'int',
        participantes: 'int',
        terreno: 'string',
        padre: {
            type: 'Semental'
        },
        madre: {
            type: 'Yegua'
        },
        peso: 'float',
        jinete: {
            type: 'Jinete'
        },
        preparador: {
            type: 'Preparador'
        },
        premios : {
          type : 'list',
          objectType : 'Premio'
        },
        cajon: 'int',
    }
};

exports.SementalSchema = {
    name: 'Semental',
    primaryKey: 'id',
    properties: {
        id: 'int',
        nombre: 'string',
        url: 'string',
    },
};

exports.YeguaSchema = {
    name: 'Yegua',
    primaryKey: 'id',
    properties: {
        id: 'int',
        nombre: 'string',
        url: 'string',
    }
}

exports.JineteSchema = {
    name: 'Jinete',
    primaryKey: 'id',
    properties: {
        id: 'int',
        nombre: 'string',
        url: 'string',
    }
}

exports.PreparadorSchema = {
    name: 'Preparador',
    primaryKey: 'id',
    properties: {
        id: 'int',
        nombre: 'string',
        url: 'string',
    }
}

exports.PremioSchema = {
    name : 'Premio',
    properties : {
        value : 'int'
    }
    
}

exports.PreviaSchema = {
    name: 'Previa',
    primaryKey : 'id',
    properties: {
        id : {type: 'string'},
        fecha: {type: 'date', optional: true},
        hipodromo: {type: 'string', optional: true},
        url: {type: 'string', optional: true},
        distancia: {type: 'int', optional: true},
        terreno : {type: 'string', optional: true},
        posicion : {type: 'int', optional: true},
        jinete : {type: 'string', optional: true},
        peso : {type: 'float', optional: true},
        ganancias : {type: 'int', optional: true},
        estadopista : {type: 'string', optional: true},
    }
}