import { useState, useEffect } from "react";

const useGetTabs = () => {
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const handleTabsChange = async () => {
      const tabs = await chrome.tabs.query({});
      const sorted = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);
      setTabs(sorted);
    };

    handleTabsChange();

    chrome.tabs.onCreated.addListener(handleTabsChange);
    chrome.tabs.onRemoved.addListener(handleTabsChange);
    chrome.tabs.onUpdated.addListener(handleTabsChange);
    chrome.tabs.onActivated.addListener(handleTabsChange);

    return () => {
      chrome.tabs.onCreated.removeListener(handleTabsChange);
      chrome.tabs.onRemoved.removeListener(handleTabsChange);
      chrome.tabs.onUpdated.removeListener(handleTabsChange);
      chrome.tabs.onActivated.removeListener(handleTabsChange);
    };
  }, []);

  return tabs;
};

export default useGetTabs;
