module.exports = function(model){
  model.restcraft = {
     name: function(){
      return model.modelName;
    },
    dependencies: function(){
      return [];
    },
    count: model.count,
    index: model.index,
    create: model.create, 
    show: model.show, 
    update: model.update, 
    destroy: model.destroy
  }
};
