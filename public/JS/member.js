var isLoading = false;

var nextPage;

var keyword = "蘋果發表會";

var newkeyword = "undefined";

var cookie = document.cookie;

var useremail = "";

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
        var thisuserid = login_response["data"]["userid"];
        var thisuseremail = login_response["data"]["useremail"];
        console.log(thisuseremail, thisuserid);
        document.getElementById("userid").innerText = thisuserid;
        document.getElementById("useremail").innerText = thisuseremail;

        thisuserphoto = login_response["data"]["photo"];
        console.log("Hi~~ " + thisuserid);
        console.log(thisuserphoto);
        console.log("已登入");
        memberphoto(thisuserphoto);
        controller.init();
      }
    };
    xhr.send(null);
  }
} else {
  console.log("未登入");
  document.location.href = "/login";
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

  let contentdiv = document.querySelector(".contentdiv");
  let _contentphoto_div = document.createElement("div");
  _contentphoto_div.classList.add("contentphoto");
  _contentphoto_div.style.cssText = "background-image: url(" + coverurl + ")";
  contentdiv.appendChild(_contentphoto_div);
}

function gohome() {
  document.location.href = "/";
}

function gomember() {
  // console.time("2 的 10 次方花費的時間");
  document.location.href = "/member";
  // // console.timeEnd("2 的 10 次方花費的時間");
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

const form = document.getElementById("form");
// const contents = document.getElementById("contents");
const loading = document.getElementById("loading");

const model = {
  post: function (formdata) {
    (async () => {
      const request = {
        method: "POST",
        body: formdata,
      };
      try {
        const response = await fetch("/upload", request);
        const result = await response.json();
        if (result.ok === true) {
          view.toreload();
        }
      } catch (err) {
        console.log(err);
      }
    })();
  },

  get: function () {
    (async () => {
      const useremail = document.getElementById("useremail").innerText;
      console.log(useremail);
      const response = await fetch(`/upload?useremail=${useremail}`);
      // const result = await response.json();
      // view.toshow(result);
    })();
  },
};

const view = {
  tolist: function (data) {
    const contents = document.createElement("div");
    contents.className = "item";

    const contentsimage = document.createElement("img");
    contentsimage.className = "item-image";
    const contentsimageurl =
      "https://d10uvafhxfdwto.cloudfront.net/" + data.photo;
    contentsimage.setAttribute("src", contentsimageurl);
    contents.append(contentsimage);

    var contentdiv = document.querySelector(".contentdiv");
    contentdiv.innerHTML = "";

    var coverurl = contentsimageurl;
    var usericon_div = document.querySelector(".usericon");
    usericon_div.style.cssText = "background-image: url(" + coverurl + ")";

    var contentdiv = document.querySelector(".contentdiv");
    let _contentphoto_div = document.createElement("div");
    _contentphoto_div.classList.add("contentphoto");
    _contentphoto_div.style.cssText = "background-image: url(" + coverurl + ")";
    contentdiv.appendChild(_contentphoto_div);

    // const contentstext = document.createElement("div");
    // contentstext.className = "item-text";
    // contentstext.textContent = data.content;
    // contents.append(contentstext);

    // return contents;
  },

  toreload: function () {
    window.location.href = "/member";
  },
};

const controller = {
  init: function () {
    model.get();
    form.addEventListener("submit", controller.send);
  },

  send: function (e) {
    let contentphoto = document.querySelector(".contentphoto");
    contentphoto.style.cssText = "background-image: url(/PNG/update.png);)";
    e.preventDefault();
    let userid = document.getElementById("userid").innerText;
    let userpassword = document.getElementById("userpassword").value;
    let useremail = document.getElementById("useremail").innerText;
    let image = document.getElementById("image");
    let formdata = new FormData();
    formdata.append("userid", userid);
    formdata.append("userpassword", userpassword);
    formdata.append("useremail", useremail);
    formdata.append("image", image.files[0]);
    model.post(formdata);
  },
};

// controller.init();
