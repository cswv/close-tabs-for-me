const TIME_ALARM_NAME = "checkAllTabs";
let handleAlarmListener = null;
let handleCreatedTabListener = null;
let handleRemovedTabListener = null;
let tabsCount = 0;

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["settings"], (result) => {
    if (result && result.settings !== undefined) {
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

async function run(settings) {
  if (settings.shouldSave) {
    runSaveChecking(settings);
  }
  if (settings.useTime) {
    runTimeChecking(settings);
  }
  if (settings.useMaxTabs) {
    runCountChecking(settings);
  }
}

async function runSaveChecking({ folderId, folderName }) {
  if (folderId) {
    const exists = await checkFolderExists(folderId);
    if (!exists) {
      folderId = await createFolder("1", folderName);
    }
  } else {
    folderId = await createFolder("1", folderName);
  }
}

function runTimeChecking({ time, timeMult, folderId }) {
  chrome.alarms.create(TIME_ALARM_NAME, {
    delayInMinutes: 0,
    periodInMinutes: (time * timeMult) / 60,
  });
  const handleAlarm = (alarm) => {
    if (alarm.name === TIME_ALARM_NAME) {
      checkAllTabs({
        time: time * 1000 * timeMult,
        folderId,
      });
    }
  };
  handleAlarmListener = handleAlarm;
  chrome.alarms.onAlarm.addListener(handleAlarmListener);
}

async function runCountChecking({ folderId, maxTabs }) {
  const tabs = await chrome.tabs.query({});
  tabsCount = tabs.length;

  const checkTabsCount = async () => {
    if (tabsCount > maxTabs) {
      const tabs = await chrome.tabs.query({});
      const sorted = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);
      while (sorted.length > maxTabs) {
        const tab = sorted[0];
        await saveToFolder(folderId, tab.title, tab.url);
        chrome.tabs.remove(tab.id);
        sorted.shift();
      }
    }
  };

  const handleCreated = () => {
    tabsCount++;
    checkTabsCount();
  };

  const handleRemoved = () => {
    tabsCount--;
  };

  checkTabsCount();

  chrome.tabs.onCreated.addListener(handleCreated);
  chrome.tabs.onRemoved.addListener(handleRemoved);
  handleCreatedTabListener = handleCreated;
  handleRemovedTabListener = handleRemoved;
}

function stop() {
  stopTimeChecking();
  stopCountChecking();
}

function stopCountChecking() {
  if (handleCreatedTabListener) {
    chrome.tabs.onCreated.removeListener(handleCreatedTabListener);
    handleCreatedTabListener = null;
  }
  if (handleRemovedTabListener) {
    chrome.tabs.onRemoved.removeListener(handleRemovedTabListener);
    handleRemovedTabListener = null;
  }
}

function stopTimeChecking() {
  chrome.alarms.clear(TIME_ALARM_NAME);
  if (handleAlarmListener) {
    chrome.alarms.onAlarm.removeListener(handleAlarmListener);
    handleAlarmListener = null;
  }
}

function checkAllTabs({ time, folderId }) {
  chrome.tabs.query({}, async (tabs) => {
    const sorted = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);
    while (sorted.length > 0) {
      const tab = sorted[0];
      if (Date.now() - tab.lastAccessed >= time) {
        await saveToFolder(folderId, tab.title, tab.url);
        chrome.tabs.remove(tab.id);
        sorted.shift();
      } else {
        break;
      }
    }
  });
}

async function saveToFolder(folderId, title, url) {
  if (folderId) {
    const exist = await checkFolderExists(folderId);
    if (exist) {
      chrome.bookmarks.create({
        parentId: folderId,
        title: title,
        url: url,
      });
    }
  }
}

function createFolder(parentId, title) {
  return new Promise((resolve) => {
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
