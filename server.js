const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//  create a connection to our database
mongoose.connect('mongodb://127.0.0.1:27017/myDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to database');   
}).catch((err) => {
    console.log('Not Connected to database ERROR! ', err);
});

// Initialize schema for our data
const dataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^#([0-9A-Fa-f]{6})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid hexadecimal color code!`,
    },
  },
});
// Create a model for our data
const Data = mongoose.model('Data', dataSchema);

// Serve static files
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/', express.static('public'));
app.use(cors());


// Endpoint to get Data on website
app.get('/budget', async (req, res) => {
    try {
      const data = await Data.find();
      res.json({"myBudget":data});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// Endpoint to add data to our database
app.post('/data', async (req, res) => {
    const { title, budget, color } = req.body;
  
    try {
      const newData = new Data({ title, budget, color });
      await newData.save();
      const jsonData={"myBudget":newData};
      res.status(201).json(jsonData);;
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// Endpoint to serve budget.json
// app.get('/budget', (req, res) => {
//     fs.readFile('budget.json', 'utf8', (err, data) => {
//         if (err) {
//             res.status(500).send('Error reading budget.json');
//             return;
//         }
//         res.send(JSON.parse(data));
//     });
// });

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});