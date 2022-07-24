function getDataPostUser() {
  let tokenGlobal = "";

  const firstName = document.getElementById("FirstName").value;
  const lastName = document.getElementById("LastName").value;
  const userName = document.getElementById("Username").value;
  const email = document.getElementById("Email").value;
  const password = document.getElementById("Password").value;

  getToken()
    .then((token) => {
      tokenGlobal = token;
    })
    .catch((error) => {
      console.log("error!");
      console.error(error);
    });

  postUser(tokenGlobal);
}

function postUser(token) {
  console.log(`Bearer ${toString(token)}`);

  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch("http://localhost:3000/allUsers/", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}
