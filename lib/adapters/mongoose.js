var async = require('async');
var _ = require('lodash');

module.exports = function(model){
  /*
    $.name: String
    $.data: {}
    $.id: String
    $.limit[$.name]: Number
    $.skip[$.name]: Number
    $.sort[$.name]: String
    $.items[$.name]: Number
    $.page[$.name]: Number
    $.admittedFields: [String]
    $.populateFields: Boolean, [String]
    $.preQuery: Function
    $.preExecution: Function
    $.preRender: Function
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

function callbackHelper(callback, $, result, err){
  callback(err, $, result);
}

function queryHelper(funcs, $, model, cb){
  if (!$)
    $ = {};
  $.model = model;
  $.name = $.name || $.model.restcraft.name();
  if (!$.items) $.items = {};
  if (!$.page) $.page = {};
  $.items[$.name] = $.items[$.name] || 50;
  $.page[$.name] = $.page[$.name] || 1;
  
  async.waterfall([
    function(callback){
      callback(null, $, null);
    },
    funcs[0],
    function($, result, callback){
      if (!$.preQuery)
        return callback(null, $, result);
      var cleanCallback = callbackHelper.bind(null, callback, $, result);
      $.preQuery.call($, result, cleanCallback);
    },
    funcs[1],
    function($, result, callback){
      if (!$.preExecution)
        return callback(null, $, result);
      var cleanCallback = callbackHelper.bind(null, callback, $, result);      
      $.preExecution.call($, result, cleanCallback);
    },
    funcs[2],
    funcs[3],
    funcs[4],
    function($, result, callback){
      if (!$.preRender)
        return callback(null, $, result);
      var cleanCallback = callbackHelper.bind(null, callback, $, result);
      $.preRender.call($, result, cleanCallback);
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
  condition[$.idField || '_id'] = $.id[$.name];
  !$.id[$.name] || result.where(condition);
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
  result.limit($.limit[$.name] || $.items[$.name]);
  result.skip($.skip[$.name]===undefined ? ($.page[$.name]-1)*$.items[$.name] : $.skip[$.name]);
  !$.sort[$.name] || result.sort($.sort[$.name]);
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