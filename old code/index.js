const express = require('express')
const app = express()

app.get('/', function(req, res) {
    res.render("index");
})
app.get('/happy', function(req, res) {
    res.send('diwali!')
})
app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})

app.get('/views/:view', function(req, res) {
    res.render(req.params.view);
});

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');