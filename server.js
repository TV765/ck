const app = require('./app');
const sequelize = require('./src/models/index');
require('./src/models/user');
require('./src/models/room');
require('./src/models/booking');

const PORT = process.env.PORT || 3000;

// Sync database trước khi start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tables created / updated');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB Error:', err));
