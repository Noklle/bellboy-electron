# Bellboy
A handy dandy app for showing you your daily timetable and counting down the minutes.

## Installation Guide
This app doesn't come packaged (i.e. with an .exe or an installer), so you're gonna have to install it manually, and then run it in developer mode. Here's how:
1. First you need Node.js, which you can download [here](https://nodejs.org/en/download). 
2. Once you've installed that, click on the green button near the top of this page that says "<> Code", and click "Download ZIP".
3. Once installed, unzip the folder to wherever you'd like.
4. Open the unzipped folder, click on the address bar (the text box that'll say something like "This PC > Downloads > etc..."), type "cmd", and press enter. This will open command prompt inside of that folder.
  - IMPORTANT: Make sure you're in the right folder! There will be a folder called "bellboy-electron-main", and another folder called the same thing inside that. You want to be in that second folder.
5. Type "npm install" and press enter. This will install all the dependencies for the app, which you'll need. This may take upwards of a couple minutes.
6. Go to your Sentral page, export your timetable as an .ics file, and make sure it is named "my_timetable.ics".
7. Create a folder named "timetables" inside the app directory, and place your .ics file in there.
A proper installer like what you may be used to from professional software is planned for the future.

## How to Run
After following the above guide, follow these steps at any time to launch the app.
1. Open command prompt in the same way as in step 4 of the installation guide.
2. Type "npm run start" and press enter. The window will open after a few seconds. If you get an error, double check that you installed Node.js.
3. Click "load timetable".
4. Check if the periods you see correspond to the correct week; if not, click "change week".
5. Profit

---

### Note for Teachers
This app is designed around how the student timetable file is structured. I am unsure of differences in how the teacher timetable works, but I know at the least that there are no study periods to pad out the school day. Therefore, you may encounter minor visual errors such as breaks being incorrectly identified as lunch or recess.
