require('dotenv').config();
const express = require('express');
const cors = require('cors');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlparser = require('url')

const app = express();



var router = express.Router;
// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology:true });

// var db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function() {
//   console.log("we're connected!");
// });

//Schema n Model
var schema = new mongoose.Schema({
  url: String
});
var Url = mongoose.model("Url", schema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});


app.post('/api/shorturl', function(req,res){
    console.log(req.body);
    const bodyurl = req.body.url;

    const something = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address)=>{
      if(!address){
        res.json({error: "Invalid URL"})
      }else{
        const url = new Url({url:bodyurl})
        url.save((err, data)=>{
          res.json({
            original_url: data.url,
            short_url: data.id
          })
        })
      }
    })
})

app.get("/api/shorturl/:id", function(req, res) {
  const id = req.params.id;
  Url.findById(id, (err, data)=>{
    if(!data){
      res.json({error: "Invalid URL"})
    }else{
      res.redirect(data.url)
    }
  })
});


app.listen(port, function() {
  console.log("Node.js listening ...");
});
