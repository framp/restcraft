module.exports = function(model){
  /*
    $.data: {}
    $.id[$.model.restcraft.name]: String
    $.limit: Number //TODO
    $.skip: Number //TODO
    $.admittedFields: [String] //TODO
    $.populateFields: Boolean, [String] //TODO
    $.preQuery: Function
    $.preExecution: Function
    $.preRender: Function
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
      !cb || cb(null, collections[$.id[$.model.restcraft.name]]);
    },
    update: function($, cb){
      collections[$.id[$.model.restcraft.name]] = $.data;
      !cb || cb(null, collections[$.id[$.model.restcraft.name]]);
    },
    destroy: function($, cb){
      var data = collections[$.id[$.model.restcraft.name]];
      delete collections[$.id[$.model.restcraft.name]];
      collectionsLength--;
      !cb || cb(null, data)
    }
  };
}; 
