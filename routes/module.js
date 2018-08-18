module.exports.sortTableNameByAreaNo = function (areaNo){
  if(areaNo < 9){
    //seoul
    return 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    return 'MBoard_Gyeonggi';
  }else{
    return console.log('error to sortTableNameByAreaNo from module');
  }
}
