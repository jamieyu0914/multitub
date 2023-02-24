var isLoading = false;

var nextPage;

var keyword = "蘋果發表會";

var newkeyword = "undefined";

// var videoId;

var cookie = document.cookie;

var thisitemId = window.location.href.split("/play/playlist/")[1];
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
  document.location.href = "/login";
}

function gohome() {
  document.location.href = "/";
}

var tag = document.querySelector(".ytlistplayer");
tag.src = `https://www.youtube.com/embed/videoseries?list=${thisitemId}`;

// function getplaylist(thisitemId) {
//   console.time("2 的 10 次方花費的時間");
//   //讀取資料
//   isLoading = true;
//   // // console.log(isLoading);
//   // let rest = document.querySelector(".list-block");
//   // rest.innerHTML = "";
//   // // console.log(keyword);
//   // // const keyword = document.getElementById("keyword").value; //查詢關鍵字 的輸入值
//   fetch(`/api/playlist?playlistId=${thisitemId}`)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       console.log(data["data"]);
//       console.log(data["data"]["videoId"]);
//       let videoId = data["data"]["videoId"];
//       getplaylistvideo(videoId);

//       return videoId;
//     });
//   isLoading = false;
//   console.timeEnd("2 的 10 次方花費的時間");
// }

// getplaylistvideo(thisitemId);

// function getplaylistvideo(videoId) {
//   var tag = document.querySelector(".ytlistplayer");
//   tag.src = `https://www.youtube.com/embed/videoseries?list=${videoId}`;
// }

// var tag = document.querySelector(".ytlistplayer");
// tag.src = `https://www.youtube.com/embed/videoseries?list=${thisitemId}`;

function logout() {
  console.time("2 的 10 次方花費的時間");
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
  console.timeEnd("2 的 10 次方花費的時間");
}
