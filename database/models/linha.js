module.exports = function (database, tipo) {
  var acesso = database.define('Linha', {
    numero: {
      type: tipo.INTEGER,
      unique: true,
      allowNull: false
    },
    nome: {
      type: tipo.STRING,
      unique: true,
      allowNull: false
    },
    circular: {
      type: tipo.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });
  return acesso; // function return
};
