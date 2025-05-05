const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`UNCAUGHT REJECTION 💥 Shutting down.....`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// Environment
// console.log(app.get('env'));
// console.log(process.env);

// console.log(process.env);
// log environment user Mohamed ... etc
// console.log(process.env.PORT);
// try to solve this bug doesn't lessen to .env prot

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  // console.log(con.connections);add  con form function (con)
  console.log('DB Connections Success!');
});
// .catch((err) => console.log('Error connecting to DB'));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`App Listening on Port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`UNHANDLED REJECTION 💥 Shutting down.....`);
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x);

//connect to local database to you need to add connect it
// mongoose.connect(process.env.DATABASE_LOCAL).then((con) => {
//   console.log(con.connections);
//   console.log('DB Connections Success!');
// });

// put it in models folder
// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Tour must have a name!'],
//     unique: true,
//   },
//   rating: { type: Number, default: 4.5 },
//   price: { type: Number, required: [true, 'Tour must have a price'] },
// });

// // Models Start With Capital Letters
// const Tour = mongoose.model('Tour', tourSchema);

// add for test only
// const testTour = new Tour({
//   name: 'The Sea Explorer',
//   price: 497,
//   rating: 4.8,
// });

// // when you save a lot of time get error case name should be unique
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => {
//     console.log('ERROR 💥', err);
//   });
