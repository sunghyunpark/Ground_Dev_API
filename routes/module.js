module.exports.sortTableNameOfArticle = function (boardType, areaNo){
  var tableName;
  if(boardType == 'match'){
    if(areaNo < 9){
      //seoul
      tableName = 'MBoard_Seoul';
    }else if(areaNo > 9){
      //gyeong gi
      tableName = 'MBoard_Gyeonggi';
    }else{
      return console.log('error to sortTableNameByAreaNo from module');
    }
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
  }else{
    return console.log('error to boardType');
  }

  return tableName;
}

module.exports.sortUpdateTableName = function(boardType){
  var updateTableName;

  if(boardType == 'match'){
    updateTableName = 'MBoardUpdate';
  }else if(boardType == 'hire'){
    updateTableName = 'HBoardUpdate';
  }else if(boardType == 'recruit'){
    updateTableName = 'RBoardUpdate';
  }

  return updateTableName;
}

module.exports.sortTableNameOfFavorite = function(boardType){
  var tableNameOfFavorite;

  if(boardType == 'match'){
    tableNameOfFavorite = 'MBFavorite';
  }else if(boardType == 'hire'){
    tableNameOfFavorite = 'HBFavorite';
  }else if(boardType == 'recruit'){
    tableNameOfFavorite = 'RBFavorite';
  }

  return tableNameOfFavorite;
}

module.exports.sortTableNameOfComment = function(boardType){
  var tableNameOfComment;

  if(boardType == 'match'){
    tableNameOfComment = 'MComment';
  }else if(boardType == 'hire'){
    tableNameOfComment = 'HComment';
  }else if(boardType == 'recruit'){
    tableNameOfComment = 'RComment';
  }

  return tableNameOfComment;
}

module.exports.sortAreaName = function(boardType, areaNo){
  var areaName;

  if(boardType == 'match'){
    if(areaNo < 9){
      //seoul
      areaName = 'Seoul';
    }else if(areaNo > 9){
      //gyeong gi
      areaName = 'Gyeonggi';
    }else{
      console.log('error to sortAreaName');
    }
  }else{
    areaName = '';
  }

  return areaName;
}
