const path = require('path');

module.exports = {
  sequelize: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'frpc-proxy.sqlite'),
  },
};
