restcraft
=========

A node.js library to manage your models as REST resources and generate REST controllers

Design
=========

restcraft provides two main functions:

 - Controller Definition
 - Models Adapter


Controller Definition
====

By using `restcraft.controller` you can define a resource using REST verbs.

restcraft.controller signature is `function(name, options)` where `name` is the name of the resource and options is an object which can be populated using the following values:

    parent: {}, String      a controller or a name
    parentPlural: String    if parent is a string, parentPlural is the plural word 
                            used for the controller (instead of relying on pluralize)
    alias: Boolean          if true, limits the routes to show, update and edit
    render: Function        if available overwrite the rendering function used by dust

The suggested way to add content to the context is adding keys to `res.locals`.
The last thing restcraft will do, is to call `res.render('controller-names/action')` delegating the rendering to express view.

    var $ = require('restcraft');
    var next = function(req, res, next){ 
      res.locals.something = 'something';
      next(); 
    }

    var controller = $.controller('object');
    
    controller.index(next);   //Create a GET /objects route
    controller.create(next);  //Create a POST /objects route
    controller.show(next);    //Create a GET /objects/:object route
    controller.edit(next);    //Create a GET /objects/:object/edit route
    controller.new(next);     //Create a GET /objects/new route
    controller.update(next);  //Create a PUT /objects/:object route
    controller.destroy(next); //Create a DEL /objects/:object route

    module.exports = controller;
    
    
A contracted version can be used by passing the options `alias`.
This option is perfect when you're working on something which is not a collection of elements but a single element

    var $ = require('restcraft');
    var next = function(req, res, next){ next(); }

    var controller = $.controller('object', {
      alias: true
    });
    
    controller.show(next);    //Create a GET /object route
    controller.edit(next);    //Create a GET /object/edit route
    controller.update(next);  //Create a PUT /object route

    module.exports = controller;
    

You can define a parent controller by passing as `parent` another restcraft controller or a string

    var $ = require('restcraft');
    var next = function(req, res, next){ next(); }

    var controller = $.controller('object', {
      parent: require('./site')
    });
    /* Those are alternatives:
    var controller = $.controller('object', {
      parent: 'site'
    });
    var controller = $.controller('object', {
      parent: 'site',
      parentPlural: 'sites'
    });
    */
    controller.index(next);   //Create a GET /sites/:site/objects route
    controller.create(next);  //Create a POST /sites/:site/objects route
    controller.show(next);    //Create a GET /sites/:site/objects/:object route
    controller.edit(next);    //Create a GET /sites/:site/objects/:object/edit route
    controller.new(next);     //Create a GET /sites/:site/objects/new route
    controller.update(next);  //Create a PUT /sites/:site/objects/:object route
    controller.destroy(next); //Create a DEL /sites/:site/objects/:object route

    module.exports = controller;

Models Adapter
====

restcraft can wrap any object and augment it with useful functions.
All the augmented functions will be available on `object.restcraft.function`
As of now it's working as intended only for [mongoose](http://mongoosejs.com) models.

    var $ = require('restcraft');
    
    var cat = require('../models/cat');
    
    $(cat).name //returns the model name)
    $(cat).dependencies //returns an object containing all the other models references
    $(cat).count //query the database to count the number of elements
    $(cat).index //query the database to retrieve the elements
    $(cat).create //query the database to create a new element
    $(cat).show //query the database to retrieve an element
    $(cat).update //query the database to update an element
    $(cat).destroy //query the database to delete an element
    
Function which use the database have all the same signature: `function($,cb)` where `$` is an object containing options and cb is a callback which is called at the end of the rendering cycle.
 
$ accepts the following options:

    name: String                       a string which overwrites the name of the object
    data: {}                           an object of data which will get used to build
    id[name]: String                   an string used to retrieve the element with this id
    idField: String                    a string used to define which property should be the id (default to _id)
    limit: Number                      a number indicating how many elements of name are returned
    skip: Number                       a number indicating how many elements of name are skipped
    sort: String                       string indicating by which fields (space separated) the elements of name will be sorted
    sort: String                       string indicating if the sort fields will be sorted asc or desc 
    items: Number                      a number indicating how many elements a page of name contains
    page: Number                       a number indicating which page of name contains
    admittedFields: [String]           an array of strings indicating the keys which will be returned to the user
    populateFields: Boolean, [String]  false by default, populate fields when reaching object references
                                       it could be an array of strings of the keys which will be populated
    preQuery: Function                 a function which is executed before setting up the query  
    preExecution: Function             a function which is executed before executing the query  
    preRender: Function                a function which is executed before rendering the documents
    
`items` and `page` will be converted to the appropriate `skip` and `limit` options so using both doesn't make much sense

    var handle = function(err, data){
      console.log(data);
    };

    $(cat).create({
      data: { name: 'Geronimo' }
    }, handle); //Thanks to mongoose this works. Even though Geronimo is not a cat name
    
    $(cat).index({ sort: {cat: 'name'}}, handle);
    
restcraft inserts other utility functions to increase the ease of use when setting up express routes
    
    $(cat).routeIndex //create the express middleware and calls index
    $(cat).routeCreate //create the express middleware and calls create
    $(cat).routeShow //create the express middleware and calls show
    $(cat).routeEdit //create the express middleware and calls show
    $(cat).routeNew //create the express middleware and calls nothing
    $(cat).routeUpdate //create the express middleware and calls update
    $(cat).routeDestroy //create the express middleware and calls destroy
    
When calling route* functions the option used to call the function will be populated with data available in `req` (and other options).

 - `req.params` is mapped to `$.id`
 - `req.body` is mapped to `$.data`
 - `req.query.resourceNameLimit` is mapped to `$.limit`
 - `req.query.resourceNameSkip` is mapped to `$.skip`
 - `req.query.resourceNameSort` is mapped to `$.sort`
 - `req.query.resourceNameItems` is mapped to `$.items`
 - `req.query.resourceNamePages` is mapped to `$.pages`
 
As a side note, I suggest using something like [body-disposal](https://github.com/framp/body-disposal) to handle the usual form data annoyances.

A full blown controller example done by using both components could be:

    var $ = require('restcraft');
    var cat = require('../models/cat');
    
    var controller = $.controller('cat');
    
    controller.index($(cat).routeIndex());
    controller.create($(cat).routeCreate());
    controller.show($(cat).routeShow({idField: 'name'}));
    controller.edit($(cat).routeEdit());
    controller.new($(cat).routeNew());
    controller.update($(cat).routeUpdate());
    controller.destroy($(cat).routeDestroy());

    module.exports = controller;
  
License
=====
MIT