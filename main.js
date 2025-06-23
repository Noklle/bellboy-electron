const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const ical = require('node-ical');
const { v4: uuidv4 } = require('uuid');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "assets/icon.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile('index.html')
}

// timetable parsing
    // convert from UTC to AEST
    function formatDateToAEST(date) {
        const formatter = new Intl.DateTimeFormat('en-AU', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const parts = formatter.formatToParts(date);
        const partMap = {};
        parts.forEach(part => partMap[part.type] = part.value);
        
        return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}`;
    }

    function timetableParser() {
      // extract relevant data
      const eventsArray = [];
      const events = ical.sync.parseFile("timetables/test_timetable3.ics") 
      let minDate = null
      for (const event of Object.values(events)) {
          if (event.type !== 'VEVENT') continue;
            // run the time zone conversion on the times
            const startAEST = formatDateToAEST(event.start);
            const endAEST = formatDateToAEST(event.end);
            const dateStr = startAEST.substring(0, 10); // "YYYY-MM-DD"

            // find earliest event
            if (!minDate || dateStr < minDate) minDate = dateStr;
          }
          if (!minDate) return []; // No valid events found

          // Calculate two-week window boundaries
          const startDate = new Date(minDate);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 14); // Add 14 days
          
          // Process only events within two-week window
          for (const event of Object.values(events)) {
              if (event.type !== 'VEVENT') continue;
              // run the time zone conversion on the times
              const startAEST = formatDateToAEST(event.start);
              const endAEST = formatDateToAEST(event.end);
              const dateStr = startAEST.substring(0, 10); // "YYYY-MM-DD"

              // Skip events outside our two-week window
              if (eventDate < startDate || eventDate >= endDate) continue;

              // Calculate week number (1 or 2)
              const daysDiff = Math.floor((eventDate - startDate) / (1000 * 60 * 60 * 24));
              const weekNum = Math.floor(daysDiff / 7) + 1;

              // extract weekday
              const weekDay = event.start.toLocaleDateString('en-AU', { weekday: 'long' });

              // extract the start and end times in 24 hour format
              const startTime = startAEST.substring(11,13) + startAEST.substring(14,16);
              const endTime = endAEST.substring(11,13) + endAEST.substring(14,16);

              // extract teacher and period from description
              const descriptionLines = event.description.split('\n')
              const teacher = descriptionLines[0].split(': ')[1] || '';
              const period = descriptionLines[1]?.split(': ')[1] || '';

              // extract room from the location
              const locationSplit = event.location.split(': ')
              const room = locationSplit[1] || '';

              // store data in an array
              eventsArray.push({
                  Class: event.summary,
                  Room: room,
                  Period: period,
                  Start_Time: startTime,
                  End_Time: endTime,
                  Day: weekDay
              });

              console.log(eventsArray);
          }
      }

timetableParser();

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})