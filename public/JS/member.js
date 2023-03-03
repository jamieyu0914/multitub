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
        if (login_response["data"] != null) {
          console.log("已登入");
          controller.init();
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

var coverurl =
  "data:image/jpeg;base64,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";

var usericon_div = document.querySelector(".usericon");
usericon_div.style.cssText = "background-image: url(" + coverurl + ")";

var contentdiv = document.querySelector(".contentdiv");
let _contentphoto_div = document.createElement("div");
_contentphoto_div.classList.add("contentphoto");
_contentphoto_div.style.cssText = "background-image: url(" + coverurl + ")";
contentdiv.appendChild(_contentphoto_div);

function gohome() {
  document.location.href = "/";
}

function gomember() {
  console.time("2 的 10 次方花費的時間");
  document.location.href = "/member";
  console.timeEnd("2 的 10 次方花費的時間");
}

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
      const result = await response.json();
      view.toshow(result);
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

  toshow: function (result) {
    const contentsdata = result.data;
    const contentsfragment = document.createDocumentFragment();

    for (let i = 0; i < contentsdata.length; i++) {
      let contents = view.tolist(contentsdata[i]);
      contentsfragment.prepend(contents);
    }
    contents.appendChild(contentsfragment);
    view.toloading(false);
  },

  toloading: function (isLoading) {
    if (isLoading == false) {
      loading.style.cssText = "display:none";
      console.log(isLoading);
    } else {
      loading.style.cssText = "display:block";
      console.log(isLoading);
    }
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
