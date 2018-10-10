module.exports.sortTableNameOfArticle = function (boardType){
  var tableName;
  if(boardType == 'free'){
    tableName = 'FBoard';
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

module.exports.sortTableNameOfComment = function(boardType){
  var tableNameOfComment;

  if(boardType == 'free'){
    tableNameOfComment = 'FComment';
  }

  return tableNameOfComment;
}
