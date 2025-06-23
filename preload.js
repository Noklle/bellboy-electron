const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  // request timetable data
  requestTimetable: () => ipcRenderer.send('request-timetable'),
  
  // receive timetable data
  onTimetableData: (callback) => {
    ipcRenderer.on('timetable-data', (_, data) => callback(data));
  }
});
