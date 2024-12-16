import { useEffect } from "react";
import { useState } from "react";
import Settings from "./components/Settings";
import TabList from "./components/TabList";
import Statistics from "./components/Statistics";
import { useTranslation } from "react-i18next";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      if (result && result.settings !== undefined) {
        setIsRunning(true);
      }
    });
  }, []);

  const changeLanguage = () => {
    i18n.changeLanguage(i18n.language.includes("ru") ? "en" : "ru");
  };

  return (
    <div className="flex flex-col w-[420px] p-4 ">
      <div className="flex justify-between">
        <h1 className="font-medium text-gray-900">{t("app.extensionName")}</h1>
        <button
          className="underline hover:bg-slate-300 px-2 duration-200"
          onClick={changeLanguage}
        >
          {i18n.language.includes("ru") ? "en" : "ру"}
        </button>
      </div>
      <p className="mb-1 text-sm text-gray-400">{t("app.extensionSubtitle")}</p>
      <p className="mb-2 pb-2 border-b">
        {t("app.status")}:{" "}
        {isRunning ? (
          <span className="text-sky-500 font-medium">{t("app.working")}</span>
        ) : (
          <span className="text-orange-500 font-medium">
            {t("app.notStarted")}
          </span>
        )}
      </p>

      <button
        className={`font-medium mb-2 arrow-down p-2 bg-slate-200 hover:bg-slate-400 duration-200 text-start ${
          isSettingsOpen ? "arrow-down_rotated" : ""
        }`}
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        {t("app.settings")}
      </button>
      {isSettingsOpen && (
        <Settings isRunning={isRunning} setIsRunning={setIsRunning} />
      )}

      <button
        className={`font-medium mb-2 arrow-down p-2 bg-slate-200 hover:bg-slate-400 duration-200 text-start ${
          isListOpen ? "arrow-down_rotated" : ""
        }`}
        onClick={() => setIsListOpen(!isListOpen)}
      >
        {t("app.byActivityDate")}
      </button>
      {isListOpen && <TabList />}

      <button
        className={`font-medium mb-2 arrow-down p-2 bg-slate-200 hover:bg-slate-400 duration-200 text-start ${
          isStatsOpen ? "arrow-down_rotated" : ""
        }`}
        onClick={() => setIsStatsOpen(!isStatsOpen)}
      >
        {t("app.statistics")}
      </button>
      {isStatsOpen && <Statistics />}
    </div>
  );
}

export default App;
