module.exports.sortTableNameOfArticle = function (boardType){
  var tableName;
  if(boardType == 'free'){
    tableName = 'FBoard';
  }else{
    return console.log('error to boardType');
  }

  return tableName;
}

module.exports.sortTableNameOfFavorite = function(boardType){
  var tableNameOfFavorite;

  if(boardType == 'free'){
    tableNameOfFavorite = 'FBFavorite';
  }

  return tableNameOfFavorite;
}
