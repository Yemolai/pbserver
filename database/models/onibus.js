module.exports = onibusModel;

function onibusModel(database, tipo) {
  var onibus = database.define('Onibus',{
    lat: {
      type: tipo.FLOAT,
      allowNull: false
    },
    lng: {
      type: tipo.FLOAT,
      allowNull: false
    },
    spd: {
      type: tipo.FLOAT,
      allowNull: true
    },
    time: {
      type: tipo.DATE,
      allowNull: false,
      defaultValue: tipo.NOW
    }
  }, {
    name: {
      singular: 'onibus',
      plural: 'onibus'
    },
    freezeTableName: true,
    classMethods: {
      relate: function (Model) {
        Model.Linha.hasMany(Model.Onibus); // Linha tem métodos para achar ônibus, ônibus tem coluna referenciando linha
        Model.Onibus.belongsTo(Model.Linha); // Onibus tem método para achar linha, ônibus tem coluna referenciando linha
        Model.Onibus.belongsTo(Model.Onibus, {as: 'from'}); // ônibus referencia seu 'from' em coluna e métodos
      }
    }
  });
  return onibus;
}
