
const express = require('express');
const mongoose = require('mongoose');
const dotEnv = require("dotenv")
dotEnv.config()
const cors = require('cors');
const bodyParser = require('body-parser');
const routes=require('./routes')


const app = express();

app.use(bodyParser.json());
app.use(cors())


app.use('/api', routes);


app.get('/', (req, res) => {
  res.send("everything is working fine")
});

app.listen(process.env.PORT, () => {
  mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log(`Server running on http://localhost:${process.env.PORT}`))
    .catch((error) => console.log(error))
});

