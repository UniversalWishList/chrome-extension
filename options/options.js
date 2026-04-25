document.addEventListener('DOMContentLoaded', function () {                                  
      // Load saved settings and populate the fields        
      chrome.storage.sync.get(['apiUrl', 'defaultList'], function (result) {                   
          if (result.apiUrl) {                                                                               document.getElementById('api-url').value = result.apiUrl;                        
          }                                                                                              if (result.defaultList) {
              document.getElementById('default-list').value = result.defaultList;
          }
      });

      // Save settings when the button is clicked
      document.getElementById('save-settings').addEventListener('click', function () {
          const apiUrl = document.getElementById('api-url').value;
          const defaultList = document.getElementById('default-list').value;

          chrome.storage.sync.set({ apiUrl, defaultList }, function () {
              const status = document.getElementById('status');
              status.textContent = 'Settings saved!';
              setTimeout(() => { status.textContent = ''; }, 2000);
          });
      });
  });