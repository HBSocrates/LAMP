import React from "react";

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var day = Math.floor(seconds / (3600*24));
    var hour = Math.floor(seconds % (3600*24) / 3600);
    var minute = Math.floor(seconds % 3600 / 60);
    var second = Math.floor(seconds % 60);

    var days = day > 0 ? day + (day == 1 ? " day, " : " days, ") : "";
    var hours = hour > 0 ? hour + (hour == 1 ? " hour, " : " hours, ") : "";
    var minutes = minute > 0 ? minute + (minute == 1 ? " minute, " : " minutes, ") : "";
    var secs = second > 0 ? second + (second == 1 ? " second" : " seconds") : "";
    return days + hours + minutes + secs;
}

export default secondsToDhms;