// NPM includes
const fs = require('fs-extra');

// File includes
const News = require('../models/News');
const upload = require('../config/multer').upload;

// Variable definitions
let newsList = [];
// postUpload variables
let redirectInfo = {
  redirected : false,
  redirectMsg : undefined,
  redirectFile : undefined,
  redirectTitle : undefined
}

//deleteDelete variables
let deleteMsg = null;

// putUpdate variables
let updateMsg = null;
let updatedCount = 0;
let updatedTitle = false;
let updatedImage = false;
let updatedText = false;

exports.getRoot = (req,res)=> {
  let newsArray;
  if(fs.existsSync('./newslist.json')){
    newsArray = fs.readFileSync('./newslist.json'); // async reads too late
    newsArray = JSON.parse(newsArray);
  }
  res.render('index',{
    newsArray
  });
}

exports.getUpload = (req,res)=> {
  if(redirectInfo.redirected == true) {
    redirectInfo.redirected = false;
    
    res.render('upload',{
      msg : redirectInfo.redirectMsg,
      file : redirectInfo.redirectFile != undefined ? redirectInfo.redirectFile : undefined,
      title : redirectInfo.redirectTitle != undefined ? redirectInfo.redirectTitle : undefined,
    });

  }
  else {
    res.render('upload',{
      msg : undefined,
      file : undefined
    });
  }
  redirectInfo.redirectFile = undefined;
  redirectInfo.redirectTitle = undefined;
  redirectInfo.redirectMsg = undefined;
  redirectInfo.redirected = false;
}

exports.postUpload = (req,res)=> {
  upload(req,res,(err) => {
    if(err) {
      res.render('upload', {
      msg : err
      });
    } 
    else {
      if(req.body.title=="" || req.body.title==undefined){
        redirectInfo.redirectMsg = "Error : No News Title Writen!";
        redirectInfo.redirected = true;
        if(req.file != undefined)
          fs.unlinkSync(`./public/uploads/${req.file.filename}`);
        res.redirect('upload');
      }
      else if(req.file == undefined) {
        redirectInfo.redirectMsg = "Error : No file selected!";
        redirectInfo.redirected = true;
        res.redirect('upload');
      } 
      else if(req.body.newsText =="" || req.body.newsText==undefined) {
        redirectInfo.redirectMsg = "Error : No News Text Writen!";
        redirectInfo.redirected = true;
        fs.unlinkSync(`./public/uploads/${req.file.filename}`);
        res.redirect('upload');
      }
      else {
        let newNews = new News(req.body.title,req.file.filename,req.body.newsText);
        // Add to file if it exists
        if(fs.existsSync('./newslist.json')){
          fs.readFile('./newslist.json', function (err, data) {
            newsList = JSON.parse(data);
            newsList.push(newNews);
            fs.writeFile("newslist.json", JSON.stringify(newsList));
          });
        } 
        // Create file if it doesn't exist
        else {
          newsList.push(newNews);
          fs.writeFile("newslist.json", JSON.stringify(newsList));
        }
        redirectInfo.redirectMsg = "file uploaded";
        redirectInfo.redirectFile = req.file.filename;
        redirectInfo.redirectTitle = req.body.title;
        redirectInfo.redirected = true;
        res.redirect('upload');
      }
    }
  });
}

exports.getUpdate = (req,res)=> {
  res.render('update',{
    msg: updateMsg
  });
  updateMsg = null;
  updatedCount = 0;
  updatedTitle = false;
  updatedImage = false;
  updatedText = false;
}

exports.putUpdate = (req,res)=> {
  upload(req,res,(err) => { // this line must be put for multer to work
    if(req.body.oldTitle != undefined && req.body.oldTitle != "") {
      if(req.body.newTitle != undefined && req.body.newTitle != ""  // meaning you chose something to change
      || req.file != undefined 
      ||req.body.newsText != undefined && req.body.newsText != "") {
        if(fs.existsSync('./newslist.json')){
          fs.readFile('./newslist.json', function (err, data) {
            newsList = JSON.parse(data);
            // find index of title in file
            let index = newsList.findIndex(function(e) {
              return e.title == req.body.oldTitle;
            });
            // if old title was found
            if(index != -1) {
              if(req.body.newTitle != undefined && req.body.newTitle != "") {
                updatedTitle = true;
                updatedCount++;
              }
              if(req.file != undefined) { 
                updatedImage = true;
                updatedCount++;
              }
              if(req.body.newsText != undefined && req.body.newsText != "") { 
                updatedText = true;
                updatedCount++;
              }
              switch(updatedCount) {
                case 1: 
                  if(updatedTitle != false) {
                    newsList[index].title = req.body.newTitle;
                    updateMsg = "Name changed successfully";
                    res.redirect('update');
                  } 
                  else if (updatedImage != false) {
                    fs.unlinkSync(`./public/uploads/${newsList[index].URL}`);
                    newsList[index].URL = req.file.filename;
                    updateMsg = "Image changed successfully";
                    res.redirect('update');
                  }
                  else if (updatedText != false) {
                    newsList[index].text = req.body.newsText;
                    updateMsg = "Text changed successfully";
                    res.redirect('update');
                  } 
                  break;
                case 2:
                  if(updatedTitle != false && updatedCount != 0) {
                    newsList[index].title = req.body.newTitle;
                    updateMsg = "Name, ";
                    updatedCount--;
                  }
                  if (updatedImage != false && updatedCount != 0) {
                    fs.unlinkSync(`./public/uploads/${newsList[index].URL}`);
                    newsList[index].URL = req.file.filename;
                    if(updatedCount == 2) updateMsg = "Image, ";
                    else updateMsg += "Image ";
                  }
                  if(updatedText != false && updatedCount != 0) {
                    newsList[index].text = req.body.newsText;
                    updateMsg += "Text ";
                  }
                  updateMsg = updateMsg + "changed successfully";
                  res.redirect('update');
                  break;
                case 3:
                  newsList[index].title = req.body.newTitle;
                  fs.unlinkSync(`./public/uploads/${newsList[index].URL}`);
                  newsList[index].URL = req.file.filename;
                  newsList[index].text = req.body.newsText;
                  updateMsg = "Name, Image, and Text changed successfully";
                  res.redirect('update');
                  break;
              }
            } // end index found
            else {
            updateMsg = "No news with that name";
            res.redirect('update');
            }
            fs.writeFile("newslist.json", JSON.stringify(newsList));
          }); // end read file
        } // end file exists
        else {
          updateMsg = "Nothing to update";
          res.redirect('update');
        }
      } // end something chosen to update
      else {
      updateMsg = "Nothing selected to update";
      res.redirect('update');
      }
    } // end old title written
    else {
      updateMsg = "No news chosen";
      res.redirect('update');
    }
  }); // end upload 
} // end route

exports.getDelete = (req,res)=> {
  res.render('delete',{
    msg : deleteMsg
  });
  deleteMsg = null;
}

exports.deleteDelete = (req,res)=> {
  upload(req,res,(err) => {
    if(req.body.title != undefined && req.body.title != "") {
      fs.readFile('./newslist.json', function (err, data) {
        newsList = JSON.parse(data);
        // find index of title in file
        let index = newsList.findIndex(function(e) {
          return e.title == req.body.title;
        }); // end index
        if(index != -1) {
          fs.unlinkSync(`./public/uploads/${newsList[index].URL}`); // remove old image file
          newsList.splice(index,1);
          deleteMsg = "News Removed successfully";
          fs.writeFile("newslist.json", JSON.stringify(newsList));
          res.redirect('/delete');
        } // end if(index)
        else {
          deleteMsg = "news Not Found";
          res.redirect('/delete');
        }
      });
    }
    else {
      deleteMsg = "No news chosen";
      res.redirect('/delete');
    }
  }); // end upload
}

exports.getArticle = (req,res)=> {
  if(fs.existsSync('./newslist.json')){
    fs.readFile('./newslist.json', function (err, data) {
      newsList = JSON.parse(data);
      let index = newsList.findIndex(function(e) {
        return e.URL.substring(0,13) == req.params.url;
      });
      if(index != -1) {
        res.render('article',{
        title : newsList[index].title,
        image : `uploads/${newsList[index].URL}`,
        text :  newsList[index].text
        });
      }
      else res.render('notFound404'); // no matching news url
    });
  }
  else res.render('notFound404'); // file not found
}

exports.get404 = (req, res, next) => {
  res.status(404).send("Sorry can't find that!")
}