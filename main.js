const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('fs');
const ical = require('node-ical');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "assets/icon.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      contextIsolation: true,
      nodeIntegration: false,
      disableBlinkFeatures: 'Autofill'
    }
  })

  win.loadFile('index.html')
}

// timetable parsing
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
        const filePath = "timetables/my_timetable.ics"

        let events;
        try {
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                return [];
            }
            events = ical.sync.parseFile(filePath);
        } catch (err) {
            console.error(`Failed to read or parse ICS file: ${err.message}`);
            return [];
        }

        const eventsArray = [];
        let minDate = null
        const allEventDates = [];

        // convert to AEST and collect dates
        for (const event of Object.values(events)) {
            if (event.type !== 'VEVENT') continue;

            const startAEST = formatDateToAEST(event.start);
            const dateStr = startAEST.substring(0, 10); // "YYYY-MM-DD"

            allEventDates.push(dateStr);
        }

        //if no events found, return empty array
        if (allEventDates.length === 0) {
            return [];
        }

        // find earliest date
        minDate = new Date(allEventDates.sort()[0] + 'T00:00:00+10:00');

        // define 2 week window
        const startWeeks = new Date(minDate);
        const endWeeks = new Date(startWeeks);
        endWeeks.setDate(endWeeks.getDate() + 14);
         
        // process vents within 2 week window
        for (const event of Object.values(events)) {
            if (event.type !== 'VEVENT') continue;

            const startAEST = formatDateToAEST(event.start);
            const endAEST = formatDateToAEST(event.end);
            // return date as a string
            const dateStr = startAEST.substring(0, 10); // "YYYY-MM-DD"
            const eventDate = new Date(dateStr);

            // skip events outside our two-week window
            if (eventDate < startWeeks || eventDate >= endWeeks) continue;

            // calculate week number (1 or 2)
            const daysDiff = Math.floor((eventDate - startWeeks) / (1000 * 60 * 60 * 24));
            const weekNum = Math.floor(daysDiff / 7) + 1;

            // extract weekday
            const weekDay = new Date(dateStr + 'T12:00:00+10:00').toLocaleDateString('en-AU', { 
            weekday: 'long',
            });

            // append week number to weekday
            // const weekDay = `${baseWeekday}${weekNum}`;

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

            // simplify class name
            const [code, rest] = event.summary.split(': ')
            const yearMatch = code.match(/Yr(\d+)/);
            const year = yearMatch ? yearMatch[1] : '';
            const subject = rest.replace(/ Yr\d+$/, '');

            // skip events shorter than 5 minutes
            const durationMs = event.end - event.start;
            if (durationMs < 5 * 60 * 1000) {
              continue;
            }

            // store data in an array
            eventsArray.push({
                Class: subject,
                Room: room,
                Period: period,
                Start_Time: startTime,
                End_Time: endTime,
                Day: weekDay,
                Week: weekNum
            });
        }
        //console.log(eventsArray); // used for debugging, ignore
        return eventsArray;
    }
// frontend timetable request
ipcMain.on('request-timetable', (event) => {
  try {
    const eventsArray = timetableParser();
    
    event.sender.send('timetable-data', eventsArray);
  } catch (error) {
    console.error('Timetable parsing failed:', error);
    event.sender.send('timetable-error', error.message);
  }
});


app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})