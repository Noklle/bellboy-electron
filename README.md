# Bellboy

---
A handy dandy app for showing you your daily timetable and counting down the minutes.

## Installation Guide
This app doesn't come packaged (i.e. with an .exe or an installer), so you're gonna have to install it manually. Here's how:
1. First you need Node.js, which you can download [Here](https://nodejs.org/en/download).
2. Once you've installed that, click on the green button near the top of this page that says "<> Code", and click "Download ZIP".
3. Once installed, unzip the folder to wherever you'd like.
4. Open the unzipped folder, click on the address bar (the text box that'll say something like "This PC > Downloads > etc..."), and type "cmd". This will open command prompt inside of that folder.
5. Type "npm install". This will install all the dependencies for the app, which you'll need. This may take upwards of a couple minutes.
6. Go to your Sentral page and export your timetable as an .ics file.
7. Place it inside the "timetables" folder inside the app directory, making sure it is named "my_timetable.ics".

## How to Run
1. Repeat step 3 from the installation guide.
2. Type "npm run start". The window will open after a few seconds.
3. Click "load timetable".
4. Check if the periods you see correspond to the correct week; if not, click "change week".
5. Profit
