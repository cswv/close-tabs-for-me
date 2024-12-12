import { useEffect } from "react";
import { useState } from "react";
import Settings from "./components/Settings";
import TabList from "./components/TabList";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      if (result && result.settings !== undefined) {
        setIsRunning(true);
      }
    });
  }, []);

  return (
    <div className="flex flex-col w-[420px] p-4 ">
      <h1 className="font-medium text-gray-900">Закрой за меня вкладки</h1>
      <p className="mb-1 text-sm text-gray-400">
        расширение, которое закроет лишние вкладки
      </p>
      <p className="mb-2 pb-2 border-b">
        статус:{" "}
        {isRunning ? (
          <span className="text-sky-500 font-medium">работает</span>
        ) : (
          <span className="text-orange-500 font-medium">не запущено</span>
        )}
      </p>

      <button
        className={`font-medium mb-2 arrow-down p-2 bg-slate-200 hover:bg-slate-400 duration-200 text-start ${
          isSettingsOpen ? "arrow-down_rotated" : ""
        }`}
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        Настройки
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
        Вкладки по дате активности
      </button>
      {isListOpen && <TabList />}
    </div>
  );
}

export default App;
