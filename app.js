// npm includes
const express = require('express');
//const bodyParser = require('body-parser');
const fs = require('fs-extra');
//const path = require('path');
const methodOverride = require('method-override');

// File includes
const routes = require('./routes/api/routes');
//const multer = require('./config/multer');

// Init app
const app = express();

//app.use(bodyParser.urlencoded({extended:true}));

// Method override (for PUT/DELETE requests)
app.use(methodOverride('_method'));

// Init template engine
app.set('view engine','ejs');

// public folder ( to store images)
//app.use(express.static(path.join(__dirname,'./public')));
app.use(express.static('./public'));

// Init routes
app.use('/',routes); // must be after the static folder middleware so images work

// to do when exiting:
// don't exit straight away
process.stdin.resume();
// function that deletes all images and newslist.json
function exitHandler(options, exitCode) { // what 
  if (options.cleanup) {
    console.log("Exiting");
    fs.emptyDir('./public/uploads');
    fs.unlink('./newslist.json');
  }
  if (options.exit) process.exit();
}
// calls exitHandler on exit of any type
process.on('exit', exitHandler.bind(null,{cleanup:true}));
// calls exitHandler on ctrl+C signal
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// Init port
const PORT = process.env.PORT || 5000;

// Listener
app.listen(PORT,console.log(`Server started on port ${PORT}`));


