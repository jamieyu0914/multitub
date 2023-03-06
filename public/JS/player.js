var isLoading = false;

var nextPage;

var keyword = "蘋果發表會";

var newkeyword = "undefined";

var cookie = document.cookie;

var thisitemId = window.location.href.split("/play/video/")[1];
console.log(thisitemId);
//判斷是否為登入狀態
if ((cookie != "") & (cookie != "token=")) {
  token = cookie.split("=")[1];
} else {
  token = "";
}

if (token != "") {
  console.log("HELLO HERE");

  function parseJwt(token) {
    //decode JWT
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    // console.log(JSON.parse(jsonPayload));
    return JSON.parse(jsonPayload);
  }

  parseJwt(token);

  getData("/api/user/auth");
  function getData(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        // console.log(JSON.parse(this.response));
        login_response = JSON.parse(this.response);
        console.log(login_response["data"]);
        if (login_response["data"] != null) {
          console.log("已登入");
          thisuserphoto = login_response["data"]["photo"];
          memberphoto(thisuserphoto);
          // const loginitemtext = document.querySelector(".loginitemtext");
          // loginitemtext.innerHTML = "登出系統";
          // const loginitem = document.querySelector("#loginitem");
          // loginitem.onclick = function () {
          //   logout();
          // };
        }
      }
    };
    xhr.send(null);
  }
} else {
  console.log("未登入");
  const loginitemtext = document.querySelector(".loginitemtext");
  loginitemtext.innerHTML = "登入/註冊";
  const loginitem = document.querySelector("#loginitem");
  loginitem.onclick = function () {
    loginandout();
  };

  // document.location.href = "/login";
  // var cookiedata;
  // cookiedata["id"] = "22";
  // cookiedata["userid"] = "introduction";
  // cookiedata["useremail"] = "introduction";
}

function memberphoto(coverurl) {
  if (coverurl == "") {
    coverurl = "/PNG/usercat.png";
  } else {
    coverurl = "https://d10uvafhxfdwto.cloudfront.net/" + coverurl;
  }
  console.log(coverurl);
  let usericon_div = document.querySelector(".usericon");
  usericon_div.style.cssText = "background-image: url(" + coverurl + ")";
}

function gohome() {
  document.location.href = "/";
}

function loginandout() {
  // console.time("2 的 10 次方花費的時間");
  document.location.href = "/login";
  // // console.timeEnd("2 的 10 次方花費的時間");
}

function gomember() {
  // console.time("2 的 10 次方花費的時間");
  document.location.href = "/member";
  // // console.timeEnd("2 的 10 次方花費的時間");
}

// Load the IFrame Player API code asynchronously
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
var player;
function onYouTubePlayerAPIReady() {
  player = new YT.Player("ytplayer", {
    height: "631px",
    width: "1122px",
    videoId: thisitemId,
  });
}

function logout() {
  // console.time("2 的 10 次方花費的時間");
  let cookiedata = parseJwt(token);

  const data = {
    id: cookiedata["id"],
    userid: cookiedata["userid"],
    useremail: cookiedata["useremail"],
  };
  console.log(cookiedata["id"]);
  console.log(cookiedata["userid"]);
  console.log(cookiedata["useremail"]);

  fetch(`/api/user/auth`, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  }).then(function (response) {
    response.json().then(function (data) {
      // console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        document.location.href = "/";
      } else if (data["error"] == true) {
        console.log("尚未登出");
      }
    });
  });
  // // console.timeEnd("2 的 10 次方花費的時間");
}
