var bus = require('express').Router();
var db = require('../db');
// var _ = require('lodash');

/**
 * Rota de listar ônibus próximos à localidade do usuário
 * @arg float query.lat valor decimal de latitude (ex.: lat=-15.8979823)
 * @arg float query.lng valor decimal de longitude (ex.: lng=-0.9872384)
 * @arg float query.rad valor decimal de distância do centro à borda da área de pesquisa (ex.:rad=0.0478)
 * ex.: http://192.168.0.14/onibus/?lat=-15.8979823&lng=-0.9872384&rad=0.0478
 *
 * @return Array<Array<Posicoes>>
 */
bus.get('/', getBusByLocation);
function getBusByLocation(req, res) {
  var absent = []; // para os que faltam
  var invalidFormat = []; // para os que estão em formato errado
  var data = { // verifica se recebeu os dados necessários
    lat: ('lat' in req.query) ? ((isNaN(parseFloat(req.query.lat))) ? false : parseFloat(req.query.lat)) : null,
    lng: ('lng' in req.query) ? ((isNaN(parseFloat(req.query.lng))) ? false : parseFloat(req.query.lng)) : null,
    rad: ('rad' in req.query) ? ((isNaN(parseFloat(req.query.rad))) ? false : parseFloat(req.query.rad)) : null
  };
  for (var variable in data) { // para cada variável
    if (data[variable] === null) { // se estiver nula é porque não recebeu
      absent.push(variable); // registra que não recebeu
    } else if (data[variable] === false) { // se for falsa é porque está no tipo errado
      invalidFormat.push(variable); // registra que está com tipo errado
    }
  }
  if (absent.length > 0) throw { status: 400, message: 'Missing: '+absent.join(', ') }; // se houver faltosos retorna erro
  if (invalidFormat.length > 0) throw { status: 400, message: 'Not number: '+invalidFormat.join(', ')}; // se houver tipos errados retorna erro

  data.rad = Math.abs(data.rad);

  db.model.Onibus.find({ // encontre os ônibus
    where: { // que atendam a estes requisitos
      $and: { // conjunção AND / E / && (cada item aqui dentro é unido com E)
        $gte: { // >=
          // @TODO adicionar a comparação de tempo, para reduzir dados velhos
          // lat>=data.lat-data.rad AND lng>=data.lng-data.rad
          lat: data.lat - data.rad,
          lng: data.lat - data.rad
        },
        $lte: { // <=
          // lat<=data.lat+data.rad AND lng<=data.lng+data.rad
          lat: data.lng + data.rad,
          lng: data.lng + data.rad
        }
      }
    },
    attributes: ['id', 'lat', 'lng', 'spd', 'time'], // trazer apenas essas colunas
    include: [ // incluir estes modelos relacionados
      {
        model: db.model.Linha // linha de ônibus que esse ônibus tem relação
      },{
        model: db.model.Onibus, // ponto anterior deste ônibus que foi registrado
        attributes: ['id','time'] // trazer só id e timestamp dele
      }],
    raw: true // agregar estes modelos relacionados como JSON
  })
  .then(function (listaDeOnibus) { // quando receber a lista de onibus
    var listaVazia = listaDeOnibus === null; // verifica se está vazia
    res.json({ // retorna dados
      error: false,
      data: (listaVazia ? [] : listaDeOnibus) // se estiver vazia, retorna vazio
    });
  })
  .catch(function (e) {
    res.status(e.status || 500).json({ error: true, message: e.message });
  });
}

/**
 * Buscar registros de ônibus selecionado ex.: http://192.168.0.14/onibus/5
 * @arg int linha Número da linha de onibus
 *
 * @return Array<Posicoes>
 */
bus.get('/:linha', getBusById);
function getBusById(req, res) {
  var linha = parseInt(req.params.linha);
  if (isNaN(linha)) throw { status: 400, message: 'linha need to be a number.'};
  db.model.Linha.findOne({ where: { 'numero': linha }, include: [{model: db.model.Onibus}] })
  .then(function (onibus) {
    if (onibus === null) throw { status: 404, message: 'Invalid onibus identifier' };
    res.json({
      error: false,
      data: onibus.get()
    });
  })
  .catch(function (e) {
    res.status(e.status || 500).json({error: true, message: e.message});
  });
}

/**
 * Registra movimentação em ônibus
 * @arg int   onibus numero do onibus
 * @arg array body.ponto ponto(com lat e lng e timestamp)
 *
 * @return Object<boolean,id>
 */
bus.post('/:onibus', postBus);
function postBus(req, res) {
  if (!('body' in req)) {
    throw { message: 'No body received.' };
  }
  var has = {
    onibus: ('onibus' in req.params),
    lat: ('lat' in req.body),
    lng: ('lng' in req.body)
  };
  if (!has.onibus) // tem dado de onibus?
    throw { message: 'Bus reference needeed' };
  if (!has.lat || !has.lng) // tem dado de ponto?
    throw { message: 'Need traffic points' };
  if (isNaN(parseFloat(req.params.onibus))) // referência à linha é númerica ?
    throw { message: 'Bus reference must be numeric' };

  var data = {
    onibus: parseInt(req.params.onibus),
    lat: parseFloat(req.body.lat),
    lng: parseFloat(req.body.lng),
    spd: ('spd' in req.body) ? parseFloat(req.body.spd) : null,
    from: ('from' in req.body) ? parseInt(req.body.from): null
  };

  var isntNumber = {
    onibus: isNaN(data.onibus),
    lat: isNaN(data.lat),
    lng: isNaN(data.lng),
    spd: (data.spd === null) ? false : isNaN(data.spd),
    from: (data.from === null) ? false : isNaN(data.from)
  };

  if (isntNumber.onibus) throw { message: 'Onibus ref. is not a number' };
  if (isntNumber.lat) throw { message: 'Latitude is not a number' };
  if (isntNumber.lng) throw { message: 'Longitude is not a number' };
  if (isntNumber.spd) throw { message: 'Speed need to be a number' };
  if (isntNumber.from) throw { message: 'Onibus from onibus ref. is not a number' };


  return db.model.Linha.findOne({
    numero: req.body.onibus
  })
  .then(function (linha) {
    if (linha === null) {
      throw { message: 'Invalid bus reference' };
    }
    return linha;
  })
  .then(function (linha) {
    return db.model.Onibus.create(data)
    .then(function (onibus) {
      return linha.addOnibus(onibus)
      .then(function() {
        return onibus;
      });
    });
  })
  .then(function (onibus) {
    res.json({
      error: false,
      data: onibus.get()
    });
  })
  .catch(function (e) {
    res.status(e.status || 500).json({ error: true, message: e.message });
  });
}

module.exports = bus;
