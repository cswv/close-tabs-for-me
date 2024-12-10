const ALARM_NAME = "checkAllTabs";

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["settings"], (result) => {
    if (result.settings !== undefined) {
      const { time, timeMult, shouldSave, folderName } = result.settings;
      run({ time, timeMult, shouldSave, folderName });
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

function run({ time, timeMult, shouldSave, folderName }) {
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 0,
    periodInMinutes: 1,
  });

  const handleAlarm = (alarm) => {
    if (alarm.name === ALARM_NAME) {
      checkAllTabs(time * 1000 * timeMult);
    }
  };

  chrome.alarms.onAlarm.removeListener(handleAlarm);
  chrome.alarms.onAlarm.addListener(handleAlarm);
}

function stop() {
  chrome.alarms.clear(ALARM_NAME);
}

function checkAllTabs(period) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (Date.now() - tab.lastAccessed >= period) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}
