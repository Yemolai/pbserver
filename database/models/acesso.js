module.exports = function (database, tipo) {
  var acesso = database.define('Acesso', {
    momento: {
      type: tipo.DATE,
      unique: true,
      allowNull: false,
      defaultValue: tipo.NOW
    }
  }, {
    classMethods: {
      relate: function (Model) {
        Model.Acesso.belongsTo(Model.User);
      }
    }
  });
  return acesso; // function return
};
