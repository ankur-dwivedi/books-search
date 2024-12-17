const express = require("express");
const router = require('./routes');
const cors = require('cors');

const app = express();
app.use(cors());
app.use('/api', router);

app.listen(4000, () => {
  console.log("app listning on port 4000");
});

module.exports = app;