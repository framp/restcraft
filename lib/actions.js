module.exports = {
  "index": function(name){
    var url = '/' + name.plural;
    url = addBaseParent(name, url);
    url = disableIfAlias(name, url);
    return ['get', url];
  },
  "new": function(name){
    var url = '/' + name.plural;
    url = addVerb(name, url, 'new');
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
    var url = name.singular;
    url = addBaseAlias(name, url);
    url = addBaseParent(name, url);
    url = addVerb(name, url, 'edit');
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
    url = name.plural + '/:' + name.model;
  url = '/' + url;
  return url;
}
function addBaseParent(name, url){
  if (name.parent)
    url = name.parent + url;
  return url;
}
function addVerb(name, url, verb){
  if (name.singular)
    url = url + '/';
  return url + verb;
}