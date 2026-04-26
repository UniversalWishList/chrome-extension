document.addEventListener('DOMContentLoaded', function () {
      document.getElementById('open-settings').addEventListener('click', function () {
          chrome.runtime.openOptionsPage();
      });
  });