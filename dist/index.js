"use strict";

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('moment-timezone');
var app = (0, _express2.default)();
var getDate = function getDate(dayPlus) {
    _moment2.default.tz.setDefault("Asia/Seoul");
    var currentDate_arr = (0, _moment2.default)().add(-42, 'days').format('YYYY MM DD').split(" ");
    var currentDate_obj = {
        year: parseInt(currentDate_arr[0]),
        month: parseInt(currentDate_arr[1]),
        day: parseInt(currentDate_arr[2])
    };
    return currentDate_obj;
};
var server = app.listen(3000, function () {
    console.log("Express server has started on port 3000");
});
var getLunch = async function getLunch(count) {
    try {
        var currentLunches = await _axios2.default.get("https://school.iamservice.net/api/article/organization/16777/group/2068031?next_token=" + String(count));
        return currentLunches;
    } catch (error) {
        console.error(error);
        return null;
    }
};
var getTodayLunch = async function getTodayLunch(count, currentDate_obj) {
    var finalLunch = void 0;
    var lunches = await getLunch(count);
    if (lunches === null) return "오늘 급식을 불러오지 못했습니다.";
    var lunches_with_date = lunches.data.articles.map(function (lunch, index, arr) {
        var menu = "";
        lunch.content.split(" ").map(function (each_menu, index, arr) {
            menu = menu + each_menu + "\n";
        });
        var date_arr = lunch.local_date_of_pub_date.split(".");

        var lunch_with_date = {
            date: {
                year: parseInt(date_arr[0]),
                month: parseInt(date_arr[1]),
                day: parseInt(date_arr[2])
            },
            menu: menu

        };
        return lunch_with_date;
    });
    var last_date = void 0;
    for (var i in lunches_with_date) {
        var lunch = lunches_with_date[i];
        if (lunch.date.year === currentDate_obj.year && lunch.date.month === currentDate_obj.month && lunch.date.day === currentDate_obj.day) {
            finalLunch = lunch.menu;
            console.log(finalLunch);
            return finalLunch + String(lunch.year) + "년 " + String(lunch.month) + "월 " + String(lunch.day) + "일 급식 입니다.";
        }

        last_date = lunches_with_date[i].date;
    }
    if (last_date.year < currentDate_obj.year) {
        console.log("nothing same");
        return "해당 날짜의 급식을 불러오지 못했습니다.";
    } else if (last_date.year === currentDate_obj.year && last_date.month < currentDate_obj.month) {
        console.log("year same");
        return "해당 날짜의 오늘 급식을 불러오지 못했습니다.";
    } else if (last_date.year === currentDate_obj.year && last_date.month === currentDate_obj.month && last_date.day < currentDate_obj.day) {
        console.log("month same");
        return "해당 날짜의 오늘 급식을 불러오지 못했습니다.";
    }

    return await getTodayLunch(count + 20);
};
var sendLunch = async function sendLunch(date) {
    var result = await getTodayLunch(0, date);
    res.status(200).send(result);
};

app.get('/api', function (req, res) {
    var currentDate_obj = getDate();
    sendLunch(currentDate_obj);
});