var async = require('async');
var _ = require('lodash');

var debug = require('debug')('restcraft:adapters:mongoose');

module.exports = function(model){
  /*
    $.name: String
    $.data: {}
    $.id[$.name]: String
    $.idField: String
    $.limit: Number
    $.skip: Number
    $.sort: String
    $.order: String
    $.items: Number
    $.page: Number
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
        //preQuery
        noopTask,
        //preExecution
        countTask,
        noopTask,
        noopTask
        //preRender
      ], $, model, cb);
    },
    index: function($, cb){
      queryHelper([
        queryTask,
        //preQuery
        limitPopulateTask,
        //preExecution
        findTask,
        noopTask,
        admittedFieldsTask
        //preRender
      ], $, model, cb);
    },
    create: function($, cb){
      queryHelper([
        noopTask,
        //preQuery
        newModelTask,
        //preExecution
        noopTask,
        setDataTask,
        admittedFieldsTask
        //preRender
      ], $, model, cb);
    },
    show: function($, cb){
      queryHelper([
        queryTask,
        //preQuery
        limitPopulateTask,
        //preExecution
        findOneTask,
        noopTask,
        admittedFieldsTask
        //preRender
      ], $, model, cb);
    },
    update: function($, cb){
      queryHelper([
        queryTask,
        //preQuery
        limitPopulateTask,
        //preExecution
        findOneTask,
        setDataTask,
        admittedFieldsTask
        //preRender
      ], $, model, cb);
    },
    destroy: function($, cb){
      queryHelper([
        queryTask,
        //preQuery
        noopTask,
        //preExecution
        findOneTask,
        removeTask,
        admittedFieldsTask
        //preRender
      ], $, model, cb);
    }
  };
};

function callbackHelper(callback, $, result, err){
  callback(err, $, result);
}

var queryParsing = [
  'limit', 'skip', 'sort', 'order', 'items', 'page', 'filter', 'search'
];

function queryHelper(funcs, $, model, cb){
  if (!$)
    $ = {};
  $.model = model;
  $.name = $.name || $.model.restcraft.name();
  $.items = $.items || 10;
  $.page = $.page || 1;
  
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
  var id = $.id;
  if (_.isObject($.id))
    id = $.id[$.name] || $.id[$.model.restcraft.name()];
  condition[$.idField || '_id'] = id;
  !id || result.where(condition);
}
var findOneTask = function($, result, callback){
  findByIdTask($, result);
  result.findOne(contextify(callback, $));
};
var newModelTask = function($, result, callback){
  callback(null, $, new $.model());
};
var setDataTask = function($, result, callback){
  
  !$.data || !result.set || result.set($.data);
  if (!result.save)
    return contextify(callback, $);
  result.save(contextify(callback, $));
};
var removeTask = function($, result, callback){
  var query = $.model.find();
  findByIdTask($, query);
  query.remove(function(err){
    contextify(callback, $).call(this, err, result);
  });
};
var limitPopulateTask = function($, result, callback){
  result.limit($.limit || $.items);
  result.skip('skip' in $ ? $.skip : ($.page-1)*$.items);
  if ($.sort){
    result.sort($.sort);
  }
  if ($.filter){
    result.where($.filter, $.search);
  }
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