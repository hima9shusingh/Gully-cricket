const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    try {
      await mongoose.connection.collection('teams').dropIndex('name_1');
      console.log('Index name_1 dropped on teams collection');
    } catch (err) {
      console.log(err.message);
    }
    try {
      await mongoose.connection.collection('players').dropIndex('name_1');
      console.log('Index name_1 dropped on players collection just in case');
    } catch (err) {
      console.log(err.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
