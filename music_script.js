var body = document.body;
const mediaQuery = window.matchMedia("(max-width: 600px)");
function Marquee() {
  let paragraph_li = document.querySelectorAll(".song_options > li > div > p");
  let paragraph_text_container = document.querySelectorAll(
    ".song_options > li > div"
  );
  paragraph_li = Array.from(paragraph_li); //convert paragraph_li from nodelist to array
  paragraph_li.forEach((el) => {
    if (
      el.offsetWidth > paragraph_text_container[0].offsetWidth &&
      paragraph_text_container[paragraph_li.indexOf(el)].classList.contains(
        "marquee"
      ) == false
    ) {
      paragraph_text_container[paragraph_li.indexOf(el)].classList.add(
        "marquee"
      );
      let animation_duration = el.offsetWidth / 60;
      animation_duration = animation_duration.toString() + "s";
      console.log(el.offsetWidth);
      console.log(animation_duration);
      el.style.setProperty("animation-duration", animation_duration);
    } else if (
      el.offsetWidth < paragraph_text_container[0].offsetWidth &&
      paragraph_text_container[paragraph_li.indexOf(el)].classList.contains(
        "marquee"
      ) == true
    ) {
      paragraph_text_container[paragraph_li.indexOf(el)].classList.remove(
        "marquee"
      );
    }
  });
}
document.addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    Song_input();
  }
});
function Song_input() {
  song_search = document.querySelector("#searchbar");
  let list = document.querySelector(".song_options");
  if (list.innerHTML != "") {
    if (
      document.querySelector("li.iframe") != "undefined" &&
      document.querySelector("li.iframe") != null
    ) {
      const observer = new MutationObserver(function (mutations_list) {
        mutations_list.forEach(function (mutation) {
          if (
            mutation.attributeName == "class" &&
            (document.querySelector("li.iframe") == "undefined" ||
              document.querySelector("li.iframe") == null)
          ) {
            console.log("class has been changed");
            removeListElements();
            observer.disconnect();
          }
        });
      });
      observer.observe(document.querySelector("li.iframe"), {
        attributes: true,
      });
      document.querySelector("iframe").classList.remove("animation");
      document.querySelector("iframe").ontransitionend = () => {
        // document.querySelector("li.iframe").style.height = "70px";
        // document.querySelectorAll("li.iframe ~ li").forEach((el) => {
        //   el.style.transform = "translateY(0%)";
        // });
        document.querySelector("iframe").remove();
        document.querySelector("li.iframe").classList.remove("iframe");
      };
    } else {
      removeListElements();
    }

    function removeListElements() {
      document.querySelectorAll("li").forEach((el) => {
        el.classList.remove("appear");
      });
      document.querySelector("li:first-child").ontransitionend = () => {
        document.querySelector(".search_bar_container").style.cssText =
          "transform:translateY(0)";
        list.innerHTML = "";
      };
    }
  }
  if (song_search.value == "") {
    return;
  }
  let song_title_value = song_search.value; //use the .value to get the input inner text
  let song_title = { song_title_value }; //always save the data as a javasrcipt object when want to send as json
  fetch("http://localhost:5000/", {
    //fetch Post method
    method: "POST", //remember  POST not Post
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ song_title_value: song_search.value }), //the value should always be a javascript object, convert the javascript object to json object and send to the server
    //or use body:JSON.stringify(song_title)
  })
    .then((res) => res.json()) // use res.json() or res.text()
    .then((data) => {
      console.log(data);
      let errStrData = "<p class='songNotFound'>Song not found</p>";
      if (data != errStrData) {
        document.querySelector(".search_bar_container").style.cssText =
          "transform:translateY(-200%)";
      }
      data.forEach((list_item) => {
        //delete the .array because it gives an error
        let list_el = document.createElement("li");
        list_el.innerHTML = `<img src="${list_item.photo}"/><div><p>${list_item.title}</p></div>`;
        list.append(list_el);
        setTimeout(function () {
          //to make the transition property make effect else it will not work
          list_el.classList.add("appear");
        }, 1000);
        list_el.addEventListener("click", () => {
          let iframe_container = document.querySelector(".iframe_container");
          let iframe = document.querySelector("iframe");
          if (typeof iframe != "undefined" && iframe != null) {
            iframe.classList.remove("animation");
            iframe.ontransitionend = () => {
              iframe.remove();
              addNewIframe();
            };
          } else {
            addNewIframe();
          }

          function addNewIframe() {
            if (mediaQuery.matches) {
              if (
                document.querySelector("li.iframe") != null &&
                document.querySelector("li.iframe") != "undefined"
              ) {
                document.querySelector("li.iframe").classList.remove("iframe");
              }
              console.log(list_item.iframe);
              // var el_iframe = new DOMParser().parseFromString(list_item.iframe, "text/xml")
              // console.log(typeof el_iframe)
              // list_el.append(el_iframe);
              list_el.innerHTML += list_item.iframe;
              document.querySelector("li iframe").src =
                document.querySelector("li iframe").src.slice(0, -1) + "0";
              list_el.classList.add("iframe");
            } else {
              iframe_container.innerHTML = list_item.iframe;
            }
            iframe = document.querySelector("iframe"); //updating with the current iframe element
            iframe.onload = () => {
              setTimeout(function () {
                iframe.classList.add("animation");
              }, 300);
            };
          }
          mediaQuery.addEventListener("change", () => {
            Marquee();
            if (
              list_el.lastElementChild.tagName == "IFRAME" &&
              mediaQuery.matches == false
            ) {
              iframe = document.querySelector("iframe"); // re value the iframe to get the latest iframe when the width of page changes
              iframe.classList.remove("animation");
              iframe.ontransitionend = () => {
                // list_el.removeChild(list_el.lastElementChild);
                document.querySelector("li iframe").remove();
                document.querySelector("li.iframe").classList.remove("iframe");
                iframe_container.innerHTML = list_item.iframe;
                iframe = document.querySelector("iframe");
                iframe.onload = () => {
                  setTimeout(function () {
                    document.querySelector("iframe").classList.add("animation");
                  }, 400);
                };
              };
            }
          });
        });
      });
      Marquee();
      new ResizeObserver(function () {
        // console.log("body width :" + body.offsetWidth);
        Marquee();
      }).observe(document.querySelector(".song_options > li > div")); //listen to element width change
      // document.querySelector(".iframe_container").innerHTML = data[1].src;
    })
    .catch((err) => {
      console.log(err);
      let errorStr = "<p class='songNotFound'>Song not found</p>";
      document.querySelector(".iframe_container").innerHTML = errorStr;
    });

  //      fetch("http://localhost:5000/") // fetch GET method
  // .then((res) => res.json()) // use res.json() or res.text()
  // .then((data) => {
  //   console.log(data);
  //   // document.querySelector("#photo").src = data;
  // });
}
