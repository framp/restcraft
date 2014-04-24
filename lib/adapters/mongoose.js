var async = require('async');
var _ = require('lodash');

module.exports = function(model){
  /*
    $.data: {}
    $.id: String
    $.limit: Number
    $.skip: Number
    $.sort: String
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
        queryTask,
        noopTask,
        countTask,
        noopTask,
        noopTask
      ], $, model, cb);
    },
    index: function($, cb){
      queryHelper([
        queryTask,
        limitPopulateTask,
        findTask,
        noopTask,
        admittedFieldsTask
      ], $, model, cb);
    },
    create: function($, cb){
      queryHelper([
        noopTask,
        newModelTask,
        noopTask,
        setDataTask,
        admittedFieldsTask
      ], $, model, cb);
    },
    show: function($, cb){
      queryHelper([
        queryTask,
        limitPopulateTask,
        findOneTask,
        noopTask,
        admittedFieldsTask
      ], $, model, cb);
    },
    update: function($, cb){
      queryHelper([
        queryTask,
        limitPopulateTask,
        findOneTask,
        setDataTask,
        admittedFieldsTask
      ], $, model, cb);
    },
    destroy: function($, cb){
      queryHelper([
        queryTask,
        noopTask,
        removeTask,
        noopTask,
        noopTask
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
var noopTask = function($, result, callback){
  callback(null, $, result);
};
var queryTask = function($, result, callback){
  callback(null, $, $.model.find());
};
var countTask = function($, result, callback){
  result.count(contextify(callback, $));
};
var findTask = function($, result, callback){
  result.find(contextify(callback, $));
};
var findByIdTask = function($, result, callback){
  var condition = {};
  condition[$.idField || '_id'] = $.id[$.model.restcraft.name()];
  !$.id[$.model.restcraft.name] || result.where(condition);
}
var findOneTask = function($, result, callback){
  findByIdTask($, result);
  result.findOne(contextify(callback, $));
};
var newModelTask = function($, result, callback){
  callback(null, $, new $.model());
};
var setDataTask = function($, result, callback){
  !$.data || result.set($.data);
  result.save(contextify(callback, $));
};
var removeTask = function($, result, callback){
  findByIdTask($, result);
  result.remove(contextify(callback, $));
};
var limitPopulateTask = function($, result, callback){
  result.limit($.limit || $.pageLength);
  result.skip($.skip===undefined ? ($.currentPage-1)*$.pageLength : $.skip);
  !$.sort || result.sort($.sort);
  if ($.populateFields===true){
    $.populateFields = Object.keys($.model.restcraft.dependencies());
  }
  for (var key in $.populateFields){
    result.populate($.populateFields[key]);
  }
  callback(null, $, result);
};
var admittedFieldsTask = function($, result, callback){
  if (!$.admittedFields)
    return callback(null, $, result);
  if (!result.length)
    return callback(null, $, _.pick(result, $.admittedFields));
  for (var i in result){
    result[i] = _.pick(result[i], $.admittedFields);
  }
  callback(null, $, result);
};