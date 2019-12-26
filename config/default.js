const path = require('path');

module.exports = {
  target: 'http://192.168.1.110:3000',
  sequelize: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'frpc-proxy.sqlite'),
  },
};
