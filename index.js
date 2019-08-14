import axios from "axios" ;
import express from "express";
import moment from "moment";
require('moment-timezone');
const app = express();
const getDate = (dayPlus) => {
  moment.tz.setDefault("Asia/Seoul");
    let currentDate_arr = moment().add(-42, 'days').format('YYYY MM DD').split(" ");
    let currentDate_obj = {
        year: parseInt(currentDate_arr[0]),
        month: parseInt(currentDate_arr[1]),
        day: parseInt(currentDate_arr[2])
    }
    return currentDate_obj
}
var server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});
const getLunch = async (count) => {
  try {
    const currentLunches =  await axios.get(`https://school.iamservice.net/api/article/organization/16777/group/2068031?next_token=${String(count)}`);
    return currentLunches
  } catch (error) {
    console.error(error);
    return null
  }
};
const getTodayLunch = async (count, currentDate_obj) => {
  let finalLunch;
  let lunches = await getLunch(count);
  if(lunches === null) return "오늘 급식을 불러오지 못했습니다."
  let lunches_with_date = lunches.data.articles.map((lunch, index, arr) => {
      let menu = "";
      lunch.content.split(" ").map((each_menu, index, arr) => {
        menu = menu + each_menu + "\n"
      })
      let date_arr = lunch.local_date_of_pub_date.split(".");

      let lunch_with_date = {
        date:{
            year: parseInt(date_arr[0]),
            month: parseInt(date_arr[1]),
            day: parseInt(date_arr[2])
        },
        menu:menu

      }
      return lunch_with_date
  })
  let last_date;
  for(let i in lunches_with_date){
      let lunch = lunches_with_date[i]
    if(lunch.date.year === currentDate_obj.year && lunch.date.month === currentDate_obj.month && lunch.date.day === currentDate_obj.day){
        finalLunch = lunch.menu;
        console.log(finalLunch)
        return finalLunch+String(lunch.year)+"년 " + String(lunch.month) + "월 " + String(lunch.day) + "일 급식 입니다."
    }

    last_date = lunches_with_date[i].date
  }
if(last_date.year < currentDate_obj.year){
    console.log("nothing same")
    return "해당 날짜의 급식을 불러오지 못했습니다."
} else if(last_date.year === currentDate_obj.year && last_date.month < currentDate_obj.month){
    console.log("year same")
    return "해당 날짜의 오늘 급식을 불러오지 못했습니다."
} else if(last_date.year === currentDate_obj.year && last_date.month === currentDate_obj.month && last_date.day < currentDate_obj.day){
    console.log("month same")
    return "해당 날짜의 오늘 급식을 불러오지 못했습니다."
}

  return await getTodayLunch(count+20)
}
const sendLunch = async(date) => {
  let result = await getTodayLunch(0, date);
  res.status(200).send(result);
}

app.get('/api', (req, res) => {
    let currentDate_obj = getDate();
    sendLunch(currentDate_obj)
});
