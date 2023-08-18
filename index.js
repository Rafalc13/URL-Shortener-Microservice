require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);

const app = express();

// Basic Configuration
const db = client.db('urlshortnert');
const link = db.collection('link');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const dnsL = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if(!address) {
      res.json({error: "Invalid url"});
    }else {
      const addUrl = await link.countDocuments({});
      const docUrl = {url, short_url: addUrl};
      const result = await link.insertOne(docUrl);
      res.json({original_url: url, short_url: addUrl});
    }
  });
});
app.get('/api/shorturl/:new_url', async (req, res) => {
  const newUrl = req.params.new_url;
  const docUrl = await link.findOne({short_url: +newUrl});
  res.redirect(docUrl.url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
