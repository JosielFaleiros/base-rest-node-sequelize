require('dotenv').config()
import morgan from 'morgan'
var express = require('express')
const cors = require('cors')
var app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('common'))

app.use('/files', express.static((require('path').join(__dirname, './files'))))

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port ' + (process.env.PORT || 3000))
})

require('./app/routes')(app)
