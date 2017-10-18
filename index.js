const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})
app.get('/happy', function (req, res) {
    res.send('diwali!')
  })
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');