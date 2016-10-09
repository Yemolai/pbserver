module.exports = function (database, tipo) {
  var user = database.define('User', {
    name: {
      type: tipo.STRING,
      unique: true,
      allowNull: false
    }
  }, {
    classMethods: {
      populate: function () { // populate return ONLY an array of objects
        return [
          { name: 'Anonymous' },
          { name: 'John Smith' }
        ];
      }
    }
  });
  return user; // function return
};
