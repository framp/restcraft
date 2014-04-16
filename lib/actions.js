module.exports = {
  "index": function(name){
    var url = '/' + name.plural;
    url = addBaseParent(name, url);
    url = disableIfAlias(name, url);
    return ['get', url];
  },
  "new": function(name){
    var url = '/' + name.plural + '/new';
    url = addBaseParent(name, url);
    url = disableIfAlias(name, url);
    return ['get', url];
  },
  "create": function(name){
    var url = '/' + name.plural;
    url = addBaseParent(name, url);
    url = disableIfAlias(name, url);
    return ['post', url];
  },
  "show": function(name){
    var url = name.singular;
    url = addBaseAlias(name, url);
    url = addBaseParent(name, url);
    return ['get', url];
  },
  "edit": function(name){
    var url = name.singular + '/edit';
    url = addBaseAlias(name, url);
    url = addBaseParent(name, url);
    return ['get', url];
  },
  "update": function(name){
    var url = name.singular;
    url = addBaseAlias(name, url);
    url = addBaseParent(name, url);
    return ['put', url];
  },
  "destroy": function(name){
    var url = name.singular;
    url = addBaseAlias(name, url);
    url = addBaseParent(name, url);
    return ['delete', url];
  }
}

function disableIfAlias(name, url){
  if (name.alias)
    return;
  return url;
}
function addBaseAlias(name, url){
  if (!name.alias)
    url = '/' + name.plural + '/:' + url;
  return url;
}
function addBaseParent(name, url){
  if (name.parent)
    url = name.parent.basePath + url;
  return url;
}