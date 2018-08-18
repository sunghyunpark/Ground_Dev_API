module.exports.sortTableName = function (boardType, areaNo){
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
