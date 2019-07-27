const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename : function(req,file,cb) {
    cb(null,Date.now() + 
    path.extname(file.originalname));
  }
});

// Check File Type (allow only image uploads)
function checkFileType(file,cb) {
  // allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  //Check Extension
  const extname = 
  filetypes.test(path.extname(file.originalname).toLowerCase());
  //Check mimetype
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname) {
    return cb(null,true);
  } else {
    cb("Error : Images Only");
  }
}

// Init Upload variable
exports.upload = multer({
  storage:storage,
  fileFilter : function (req,file,cb) {
    checkFileType(file,cb);
  }
}).single('myImage');