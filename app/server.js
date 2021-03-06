const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./models/data');

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// import environmental variables from our variables .env.local file
require('dotenv').config({ path: '../.env.local' });

// this is our MongoDB database
const dbRoute = (process.env.DATABASE);

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// this is our get method
// this method fetches all available data in our database
// http://localhost:3001/api/getData
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
// http://localhost:3001/api/updateData
router.post('/updateData', (req, res) => {
  const { id, update } = req.body;

  Data.updateOne({ "id": id, "message": update }, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
// http://localhost:3001/api/deleteData
router.delete('/deleteData', (req, res) => {
  const { id } = req.body;

  Data.deleteOne({ id }, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// this is our create methid
// this method adds new data in our database
// http://localhost:3001/api/putData
router.put('/putData', (req, res) => {
  let data = new Data();

  const { id, message } = req.body;

  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.message = message;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});



// this is our get method
// this method fetches all available data in our database
// http://localhost:3001/api/getData
router.get('/getDataGcp', (req, res) => {


  // GOOGLE GCP VISION

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ProductSearchClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  const projectId = 'sy-inlab';
  const location = 'us-central1-f';
  const productSetId = '0';
  const productSetDisplayName = 'product set test id 0';

  // // Resource path that represents Google Cloud Platform location.
  const locationPath = client.locationPath(projectId, location);

  const productSet = {
    displayName: productSetDisplayName,
  };

  const request = {
    parent: locationPath,
    productSet: productSet,
    productSetId: productSetId,
  };


  const [createdProductSet] = async() => {
    await client.createProductSet(request);
  }

  // const [createdProductSet] = await client.createProductSet(request);
  // console.log(`Product Set name: ${createdProductSet.name}`);

  return res.json({ success: true, productSet: [createdProductSet] });

});


// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
