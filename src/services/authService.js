const { Op } = require('sequelize');
const db = require('../models');
const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');