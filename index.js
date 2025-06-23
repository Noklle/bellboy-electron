setInterval(showTime, 500);

// variables
var date = new Date();
var hour = 0;
var min = 0;
var sec = 0;
var month = 0;
var day = 0;

// persistent variables
let time24 = localStorage.getItem('time24') === 'true' || false;
let currentWeek = parseInt(localStorage.getItem('currentWeek')) || 1;

// clock
function showTime() {
    // get current time/date
    date = new Date();
    hour = date.getHours();
    min = date.getMinutes();
    sec = date.getSeconds();
    month = date.getMonth() + 1;
    day = date.getDate();
    var am_pm = "AM";
    var twelve_hour = hour;
    // convert day number to word
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    
    var weekday = days[date.getDay()];
    
    //12hr format
    if (time24 == false) {
        if (hour >= 13) {
            twelve_hour = hour -= 12;
            am_pm = "  PM";
        }
        else if (hour >= 12) {
            am_pm = "  PM";
        }
        else if (hour < 12) {
            am_pm = "  AM";
        }
    }
    else if (hour == 0) {
        twelve_hour = 12;
        am_pm = "  AM"; 
    }
    if (time24 == true) {
        twelve_hour = hour;
        am_pm = "";
    }
    
    //if the time value is single digit, add a leading zero
    var zeromin = min < 10 ? "0" + min : min;
    var zerosec = sec < 10 ? "0" + sec : sec;
    
    var currentTime = twelve_hour + ":" + zeromin + ":" + zerosec + am_pm;
    var currentDate = weekday + " " + day + "/" + month;
    
    // Displaying the time
    var clockElement = document.getElementById("clock");
    if (clockElement) clockElement.innerHTML = currentTime;
    
    // Displaying the date
    var dateElement = document.getElementById("date");
    if (dateElement) dateElement.innerHTML = currentDate;
}   
// call the function
showTime();

// 24 hour time Button
function time24Toggle() {
    time24 = !time24;
    localStorage.setItem('time24', time24);
    console.log("24-hour time: " + (time24 ? "Enabled" : "Disabled"));
    showTime();
}

// change current week
function changeWeek() {
    currentWeek = currentWeek === 1 ? 2 : 1;
    localStorage.setItem('currentWeek', currentWeek);
    console.log('Current week: ', currentWeek);
}

// settings button
async function open_settings() {
    console.log("Settings button clicked");
    // Electron IPC call would go here
    // Example: ipcRenderer.send('open-settings-window')
}

//light dark mode button
var light = true;

function lightDarkToggle() {
    light = !light;
}

// dialrim     
function updateDialRim(start, end) {
    // convert times to minutes, calculate remaining time
    var date = new Date();
    // convert 24hr to minutes
    let start_hours = start.substring(0,2);
    let start_minutes = start.substring(2,4);
    var start_min_total = Number(start_hours) * 60 + Number(start_minutes);

    let end_hours = end.substring(0,2);
    let end_minutes = end.substring(2,4);
    var end_min_total = Number(end_hours) * 60 + Number(end_minutes);

    // calculate remaining time in minutes
    var current_min = (date.getHours() * 60) + date.getMinutes();
    var remaining_min = end_min_total - current_min;
    var remaining_min_disp = remaining_min;

    if (remaining_min < 0) {
        remaining_min = 0;
    } else if (remaining_min > 999) {
        remaining_min_disp = 999;
    }

    // convert remaining time to percentage
    var progress_percentage_remaining = (remaining_min / (end_min_total - start_min_total)) * 100;
    if (progress_percentage_remaining > 100) {
        progress_percentage_remaining = 100;
    } else if (progress_percentage_remaining < 0) {
        progress_percentage_remaining = 0;
    }

    // draw dial rim based on percentage remaining
    var progress_degs_n = (100 - progress_percentage_remaining) * 3.6;
    var progress_rads_e = (progress_degs_n - 90) * (Math.PI/180);
    var canvas = document.getElementById("dialRim");
    if (!canvas) return;
    
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(50, 50, 40, Math.PI * 1.5, progress_rads_e, true);
    ctx.lineWidth = 20;
    ctx.strokeStyle = "#008CFF";
    ctx.stroke();
    
    // convert remaining minutes to string and display number
    var remaining_min_disp_str = remaining_min_disp.toString();
    var dialCentreElement = document.getElementById("dialCentre");
    if (dialCentreElement) dialCentreElement.innerHTML = remaining_min_disp_str;
    console.log("Remaining minutes: " + remaining_min_disp_str);

}

function dialRimTimer() {
    updateDialRim("0000", "2400");
}

setInterval(dialRimTimer, 1000);

function drawTimetable(eventsArray) {
    const today = new Date();
    const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    if (typeof currentWeek === 'undefined') {
        console.warn('currentWeek is not defined; defaulting to 1');
        window.currentWeek = 1;
    }

    // filter events based on day and week
    const filtered = eventsArray.filter(evt => {
        return evt.Day === todayName && evt.Week === currentWeek;
    });

    // clear timetable container
    const container = document.getElementById('timetableContainer');
    if (!container) {
        console.error('No element with id "timetableContainer" found in HTML');
        return;
    }
    container.innerHTML = '';

    // draw timetable
    if (filtered.length === 0) {
        const msg = document.createElement('p');
        msg.innerText = 'No classes.';
        container.appendChild(msg);
    } else {
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        for (const evt of filtered) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.innerText = `${evt.Class} - Room ${evt.Room}`;
        tr.appendChild(td);
        tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        container.appendChild(table);
    }
}

function requestAndDrawTimetable() {
    window.electronAPI.requestTimetable();

    // clear event listeners
    window.electronAPI.onTimetableData((eventsArray) => {
        console.log('Received timetable data.');
        drawTimetable(eventsArray);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loadTTBL').addEventListener('click', () => {
        requestAndDrawTimetable(); // run when button clicked
    });

    requestAndDrawTimetable(); // auto-run on app launch
});

function getCurrentEvent() {
}
