var async = require('async');
var _ = require('underscore');

module.exports = function(model){
  /*
    $.data: {}
    $.id: String
    $.limit: Number
    $.skip: Number
    $.pageLength: Number
    $.currentPage: Number
    $.admittedFields: [String]
    $.populateFields: Boolean, [String]
    $.hooks: {preQuery: Function, preExecution: Function, preRender: Function}
  */
  
  var dependencies = null;
  model.restcraft = {
    name: function(){
      return model.modelName;
    },
    dependencies: function(){
      if (dependencies)
        return dependencies;
      dependencies = {};
      model.schema.eachPath(function(key, value){ 
        if (value.options && value.options.ref)
          dependencies[key] = value.options.ref;
        if (value.caster && value.caster.options && value.caster.options.ref)
          dependencies[key] = value.caster.options.ref;
      });
      return dependencies;
    },
    count: function($, cb){
      queryHelper([
        queryCallback,
        noopCallback,
        countCallback,
        noopCallback,
        noopCallback
      ], $, model, cb);
    },
    index: function($, cb){
      queryHelper([
        queryCallback,
        limitPopulateCallback,
        findCallback,
        noopCallback,
        admittedFieldsCallback
      ], $, model, cb);
    },
    create: function($, cb){
      queryHelper([
        noopCallback,
        noopCallback,
        newModelCallback,
        setDataCallback,
        admittedFieldsCallback
      ], $, model, cb);
    },
    show: function($, cb){
      queryHelper([
        queryCallback,
        limitPopulateCallback,
        findByIdCallback,
        noopCallback,
        admittedFieldsCallback
      ], $, model, cb);
    },
    update: function($, cb){
      queryHelper([
        queryCallback,
        limitPopulateCallback,
        findByIdCallback,
        setDataCallback,
        admittedFieldsCallback
      ], $, model, cb);
    },
    destroy: function($, cb){
      queryHelper([
        queryCallback,
        noopCallback,
        removeCallback,
        noopCallback,
        noopCallback
      ], $, model, cb);
    }
  };
};

function queryHelper(funcs, $, model, cb){
  if (!$)
    $ = {};
  if (!$.hooks)
    $.hooks = {};
  $.model = model;
  $.pageLength = $.pageLength || 50;
  $.currentPage = $.currentPage || 1;
  
  async.waterfall([
    function(callback){
      callback(null, $, null);
    },
    funcs[0],
    function($, result, callback){
      if (!$.hooks.preQuery)
        return callback(null, $, result);
      $.hooks.preQuery($, result, callback);
    },
    funcs[1],
    function($, result, callback){
      if (!$.hooks.preExecution)
        return callback(null, $, result);
      $.hooks.preExecution($, result, callback);
    },
    funcs[2],
    funcs[3],
    funcs[4],
    function($, result, callback){
      if (!$.hooks.preRender)
        return callback(null, $, result);
      $.hooks.preRender($, result, callback);
    }
  ], function(err, $, result){
    !cb || cb(null, result);
  });
};

var contextify = function(func, context){
  return function(err, result){
    func.call(this, err, context, result);
  };
}
var noopCallback = function($, result, callback){
  callback(null, $, result);
};
var queryCallback = function($, result, callback){
  callback(null, $, $.model.find());
};
var countCallback = function($, result, callback){
  result.count(contextify(callback, $));
};
var findCallback = function($, result, callback){
  result.find(contextify(callback, $));
};
var findByIdCallback = function($, result, callback){
  !$.id || result.where({_id: $.id});
  result.findOne(contextify(callback, $));
};
var newModelCallback = function($, result, callback){
  callback(null, $, new $.model());
};
var setDataCallback = function($, result, callback){
  !$.data || result.set($.data);
  result.save(contextify(callback, $));
};
var removeCallback = function($, result, callback){
  !$.id || result.where({_id: $.id});
  result.remove(contextify(callback, $));
};
var limitPopulateCallback = function($, result, callback){
  result.limit($.limit || $.pageLength);
  result.skip($.skip===undefined ? ($.currentPage-1)*$.pageLength : $.skip);
  if ($.populateFields===true){
    $.populateFields = Object.keys($.model.restcraft.dependencies());
  }
  for (var key in $.populateFields){
    result.populate($.populateFields[key]);
  }
  callback(null, $, result);
};
var admittedFieldsCallback = function($, result, callback){
  if (!$.admittedFields)
    return callback(null, $, result);
  if (!result.length)
    return callback(null, $, _.pick(result, $.admittedFields));
  for (var i in result){
    result[i] = _.pick(result[i], $.admittedFields);
  }
  callback(null, $, result);
};