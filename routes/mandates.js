var express = require('express');
var router = express.Router();

// Require controller modules.

var mandate_controller = require('../controllers/mandatsController');



// GET request for creating Author. NOTE This must come before route for id (i.e. display mandate).
router.get('/mandate/create', mandate_controller.mandate_create_get);

// POST request for creating Author.
router.post('/mandate/create', mandate_controller.mandate_create_post);

router.get('/mandate/import', mandate_controller.mandate_import_get);

router.post('/mandate/import', mandate_controller.mandate_import_post);

// GET request to delete Author.
router.get('/mandate/deleteall', mandate_controller.mandate_deleteall_get);

// POST request to delete Author.
router.post('/mandate/deleteall', mandate_controller.mandate_deleteall_post);

// GET request to delete Author.
router.get('/mandate/:id/delete', mandate_controller.mandate_delete_get);

// POST request to delete Author.
router.post('/mandate/:id/delete', mandate_controller.mandate_delete_post);

// GET request to update Author.
router.get('/mandate/:id/update', mandate_controller.mandate_update_get);

// POST request to update Author.
router.post('/mandate/:id/update', mandate_controller.mandate_update_post);

// GET request for one Author.
router.get('/mandate/:id', mandate_controller.mandate_detail);

// GET request for list of all Authors.
router.get('/', mandate_controller.mandate_list);


module.exports = router;