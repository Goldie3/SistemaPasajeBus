require('dotenv').config();
const express = require('express');
const cors = require('cors');                              
const errorHandler = require('./middleware/errorHandler');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors({                                            
  origin: 'http://localhost:3000',
  credentials: true,
}));                                                     

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/index');
app.use('/', routes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:3000`);
});