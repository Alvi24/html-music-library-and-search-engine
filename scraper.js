//!!! THE EXECUTION WILL NEVER STOP BECAUSE IT IS A SERVER (use Ctrl(control) + c to stop the execution)
// run the code or you will get error and use (nmp run devstart)on terminal to use nodemon or follow this link https://stackoverflow.com/questions/63423584/how-to-fix-error-nodemon-ps1-cannot-be-loaded-because-running-scripts-is-disabl
// if the terminal freezes pres constrol + c
if (typeof window !== "undefined") {
  console.log("You are on the browser"); //to check if you are on the server side or client side rendering
} else {
  console.log("You are on the server");
}
var express = require("express");
var app = express();
app.use(express.urlencoded({ extended: false })); //use this if you want to use data that comes from a Form(input)
app.use(express.json()); //use this if you want to use data that comes as JSON or use both
app.listen("5000");
const cors = require("cors");
const { resolveObjectURL } = require("buffer");
const { endianness } = require("os");
const corsOptions = {
  //use corsOptions an app.use(cors to fix the cost error)
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use this after the variable declaration
function Api_POST() {
  app.post("/", (req, res) => {
    Scraper(req.body.song_title_value).then((song_iframe) => {
      // the song_iframe is the returned value from Scraper
      res.send(JSON.stringify(song_iframe));
    });
    // console.log(req.body);
    // console.log(req.body.song_title_value);
  });
  //   app.get("/", (req, res) => {
  //   res.send(JSON.stringify(url)); //use Json.stringfy() to convert a value to json valid
  // });
}
async function Scraper(song_name) {
  console.log(song_name);
  const puppeteer = require("puppeteer");
  const browser = await puppeteer
    .launch
    //remove (the headless,defaultViewport and the curly brackets)property if you want the chromium page to not open
    // {
    //   headless: false, //to make the browser headless
    //   defaultViewport: false, // not use the default but
    // }
    ();
  try {
    const page = await browser.newPage();
    await page.goto(`https://audiomack.com/search?q=${song_name}`); //you should use `` to insert the variable
    // await page.screenshot({path: "screenshot.jpg"}); `
    const Title = await page.title();
    // page.setDefaultNavigationTimeout(0); // use this if timeout error
    //if it says Error: No element found for selector: .music-interactions__words button.music-interaction) the problem might be another error or run the server code again to fix
    //!!DONT FORGET TO USE {waitUntil:'networkidle2'} on waitForNavigation when navigating from a page to another
    const ArrayOfSongs = await page.$$eval(
      //console.log() doesn't work inside eval functions
      ".music-detail--song .music-interactions__words button.music-interaction",
      (embededButton) => {
        class Song {
          constructor(title, iframe, photo) {
            this.title = title;
            this.iframe = iframe;
            this.photo = photo;
          }
        }
        //AFTER YOU FINISH SAVE ALL THE DATA IN A ARRAY OF OBJECT AND RETURN THEM
        let songObjectArray = [];
        let iterator = 0;
        var songPhoto = document.querySelectorAll(".music-detail--song img");
        for (const one_embededButton of embededButton) {
          one_embededButton.click(); // to click the embeded button
          let songTitle = document.querySelector(
            ".Modal-module__subTitle--3UAt3"
          ).innerText;
          let song_iframe = document.querySelector(
            "textarea.music-detail__embed-textarea"
          ).value;
          songObjectArray.push(
            new Song(songTitle, song_iframe, songPhoto[iterator++].src)
          );
          let maxElementLimit=5;
          if (songObjectArray.length == maxElementLimit) {
            break;
          }
        }
        return songObjectArray;
      }
    );
    // console.log(ArrayOfSongs);H
    await browser.close();
    if (ArrayOfSongs.length == 0) {
      return "<p class='songNotFound'>Song not found</p>";
    }
    return ArrayOfSongs; //remember async functions return promises
  } catch (err) {
    console.log(err);
    await browser.close();
    return "<p class='songNotFound'>Song not found</p>"; //when the song is not found or an error happened
  }
}
Api_POST();
