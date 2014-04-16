module.exports = function(model){
  /*
    $.data: {}
    $.id: String
    $.limit: Number //TODO
    $.skip: Number //TODO
    $.admittedFields: [String] //TODO
    $.populateFields: Boolean, [String] //TODO
    $.hooks: {preQuery: Function, preExecution: Function, preRender: Function}
  */
  
  var collections = {};
  var collectionsLength = 0;
  
  model.restcraft = {
    name: function(){
      return model.modelName;
    },
    count: function($, cb){
      !cb || cb(null, collectionsLength);
    },
    index: function($, cb){
      !cb || cb(null, collections);
    },
    create: function($, cb){
      $.data._id = + new Date;
      collections[$.data._id] = $.data;
      collectionsLength++;
      !cb || cb(null, $.data);
    },
    show: function($, cb){
      !cb || cb(null, collections[$.id]);
    },
    update: function($, cb){
      collections[$.id] = $.data;
      !cb || cb(null, collections[$.id]);
    },
    destroy: function($, cb){
      var data = collections[$.id];
      delete collections[$.id];
      collectionsLength--;
      !cb || cb(null, data)
    }
  };
}; 
