function isLoginPage() {
  // Check for specific elements or URL patterns that indicate a login page
  const currentURL = window.location.href;
  const hasPasswordInput = document.querySelector('input[type="password"]') !== null;
  const hasLoginForm = document.querySelector('form[action*="/login"]') !== null;

  // Return true if either a password input or a login form is found
  return hasLoginForm || hasPasswordInput || currentURL.includes('/login');
}
async function getCreds(user) {
  const data = { url: window.location.href, usr: user };
  try {
    const response = await fetch("http://localhost:3000/getCreds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error("Request failed with status: " + response.status);
    }
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error(error);
    throw error;
  }
}
function addNewCreds(email,passwd, user){
  
  const data = { email: email, passwd: passwd, url: window.location.href, usr: user};

  fetch("http://localhost:3000/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      // Handle the response from the API
      console.log(result);
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      console.error(error);
    });
}
function findUsernameField() {
  const keywords = ['username', 'email']; // Keywords associated with the username input field

  const inputs = document.getElementsByTagName('input');

  let usernameInput = null;

  for (const input of inputs) {
    // Check if name, type, or placeholder contains any of the keywords
    const inputName = input.name.toLowerCase();
    const inputType = input.type.toLowerCase();
    const inputPlaceholder = input.placeholder.toLowerCase();

    if (keywords.some(keyword => inputName.includes(keyword)) ||
        keywords.some(keyword => inputType.includes(keyword)) ||
        keywords.some(keyword => inputPlaceholder.includes(keyword))) {
      usernameInput = input;
      break;
    }
  }
  console.log(usernameInput);
  return usernameInput;
}
function findpasswdfield(){
  const keywords = ['password', 'login']; // Keywords associated with the input field

  const inputs = document.getElementsByTagName('input');

  let passwordInput = null;

  for (const input of inputs) {
    // Check if name, type, or placeholder contains any of the keywords
    const inputName = input.name.toLowerCase();
    const inputType = input.type.toLowerCase();
    const inputPlaceholder = input.placeholder.toLowerCase();

    if (keywords.some(keyword => inputName.includes(keyword)) &&
        keywords.some(keyword => inputType.includes(keyword)) ||
        keywords.some(keyword => inputPlaceholder.includes(keyword))) {
      passwordInput = input;
      break;
    }
  }

  console.log(passwordInput);
  return passwordInput;
}
function findLoginButton(){

  const keywords = ['login', 'signin', 'submit', ]; // Keywords associated with the login button
  
  const buttons = document.getElementsByTagName('button');

  let loginButton = null;

  for (const button of buttons) {
    // Check if innerHTML, onclick, or id contains any of the keywords
    const buttonText = button.innerHTML.toLowerCase();
    const buttonOnclick = button.getAttribute('onclick') || '';
    const buttonId = button.id.toLowerCase();
    const type = button.type;

    if (keywords.some(keyword => buttonText.includes(keyword)) ||
        keywords.some(keyword => buttonOnclick.includes(keyword)) ||
        keywords.some(keyword => buttonId.includes(keyword)) ||
        keywords.some(keyword => type.includes(keyword))) {
      loginButton = button;
      break;
    }
  }

  console.log(loginButton);
  return loginButton;
}
async function verify(person) {
  if (person !== null) {
    try {
      const response = await fetch(`http://localhost:3000/verify/${person}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Request failed');
        throw new Error('Request failed');
      }
    } catch (error) {
      console.error('Request failed', error);
      throw error;
    }
  } else {
    return null;
  }
}
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message == "refreshed"){
      const isLogin = isLoginPage();
      chrome.storage.sync.get(["user"]).then(async (result) => {
        var user = result.user;
        if (isLogin){
          if (!user){
            let person = await window.prompt("enter Main app username \n this will only appear once.");
            chrome.storage.sync.set({ user : person }).then(() => {
              console.log("Value is set");
            });
          }
          chrome.storage.sync.get(["user"]).then(async (result) => {
            console.log("Value currently is " + result.user);
            const verified = await verify(user);
            console.log(verified.verified);
            if (verified.verified){
              const creds = await getCreds(user);
              let loginButton = findLoginButton();
              let email = findUsernameField();
              let passwd = findpasswdfield();
              if(creds != null || creds != undefined){
                if(email.placeholder.length > 0){
                  email.placeholder = "";
                }
                if (passwd.placeholder.length > 0){
                  passwd.placeholder = "";
                }
                email.value= creds.email;
                email.textContent = creds.email;
                email.innerHTML - creds.email;
                email.innerText = creds.email;
                passwd.value = creds.passwd;
                passwd.textContent = creds.passwd;
                passwd.innerHTML = creds.passwd;
                passwd.innerText = creds.passwd;
              }
              loginButton.onclick = function() {
                addNewCreds(email.value, passwd.value, user);
                console.log("saved");
              };
              
            }
            sendResponse({verified});
          });
        }
        sendResponse({isLogin});
      });
    }
  });