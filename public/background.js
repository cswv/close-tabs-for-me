const ALARM_NAME = "checkAllTabs";

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["settings"], (result) => {
    if (result.settings !== undefined) {
      run(result.settings);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "run") {
    run(message.payload);
    sendResponse({ status: "running" });
  } else if (message.action === "stop") {
    stop();
    sendResponse({ status: "stopped" });
  }
  return true;
});

async function run({ time, timeMult, shouldSave, folderName, folderId }) {
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 0,
    periodInMinutes: 1,
  });

  if (shouldSave) {
    if (folderId) {
      const exists = await checkFolderExists(folderId);
      if (!exists) {
        folderId = await createFolder("1", folderName);
      }
    } else {
      folderId = await createFolder("1", folderName);
    }
  }

  const handleAlarm = (alarm) => {
    if (alarm.name === ALARM_NAME) {
      checkAllTabs(time * 1000 * timeMult, folderId);
    }
  };

  chrome.alarms.onAlarm.removeListener(handleAlarm);
  chrome.alarms.onAlarm.addListener(handleAlarm);
}

function stop() {
  chrome.alarms.clear(ALARM_NAME);
}

function checkAllTabs(period, folderId) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(async (tab) => {
      if (Date.now() - tab.lastAccessed >= period) {
        if (folderId) {
          const exist = await checkFolderExists(folderId);
          if (exist) {
            chrome.bookmarks.create({
              parentId: folderId,
              title: tab.title,
              url: tab.url,
            });
          }
        }
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

function createFolder(parentId, title) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.create({ parentId, title }, (newFolder) => {
      chrome.storage.sync.get(["settings"], (result) => {
        chrome.storage.sync.set({
          settings: { ...result.settings, folderId: newFolder.id },
        });
      });
      resolve(newFolder.id);
    });
  });
}

function checkFolderExists(folderId) {
  return new Promise((resolve) => {
    chrome.bookmarks.get(folderId, (results) => {
      if (chrome.runtime.lastError) {
        resolve(false);
      } else {
        const folder = results[0];
        if (folder && folder.url === undefined) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}
