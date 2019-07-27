// NPM includes
const router = require('express').Router();

// File includes
const controller = require('../../controllers/api_controllers');

// @route GET /
// @desc  renders home page
router.get('/',controller.getRoot);

// @route GET /upload
// @desc  add new news form
router.get('/upload',controller.getUpload); 

// @route POST /upload
// @desc  adds new news
router.post('/upload',controller.postUpload); 


// @route GET /update
// @desc  update news form
router.get('/update',controller.getUpdate);


// @route PUT /update
// @desc  updates a news 
router.put('/update',controller.putUpdate); 

// @route GET /delete
// @desc  delete a news Form
router.get('/delete',controller.getDelete);

// @route DELETE /delete
// @desc  deletes a news 
router.delete('/delete',controller.deleteDelete); 

// @route GET /:URL
// @desc  displays a page for a specific news, with text
router.get('/:url',controller.getArticle);

// @route GET any route not found 
// desc   Displays a 404 not found page
router.use(controller.get404);

module.exports = router;