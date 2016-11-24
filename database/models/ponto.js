module.exports = function (database, tipo) {
  var acesso = database.define('Ponto', {
    lat: {
      type: tipo.FLOAT,
      allowNull: false
    },
    lng: {
      type: tipo.FLOAT,
      allowNull: false
    },
    sentido: {
      type: tipo.ENUM('ida', 'volta'),
      allowNull: false
    }
  }, {
    classMethods: {
      relate: function (Model) {
        Model.Linha.hasMany(Model.Ponto);
        Model.Ponto.belongsTo(Model.Ponto, { as: 'From' });
      }
    }
  }
);
  return acesso; // function return
};
