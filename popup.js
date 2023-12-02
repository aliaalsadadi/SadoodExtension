chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "checkLoginPage" }, (response) => {
      console.log(response);
      const statusElement = document.getElementById("status");
      if (response && response.isLogin) {
        statusElement.innerText = "This is a login page.";
      } else {
        statusElement.innerText = "This is not a login page.";
      }
    });
  });