import { useEffect } from "react";
import { useState } from "react";

function App() {
  const [time, setTime] = useState(1);
  const [timeMult, setTimeMult] = useState(60 * 60);
  const [shouldSave, setShouldSave] = useState(false);
  const [folderName, setFolderName] = useState("закрытые вкладки");
  const [folderId, setFolderId] = useState(undefined);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      if (result && result.settings !== undefined) {
        setTime(result.settings.time);
        setTimeMult(result.settings.timeMult);
        setShouldSave(result.settings.shouldSave);
        setFolderName(result.settings.folderName);
        setFolderId(result.settings.folderId);
        setIsRunning(true);
      }
    });
  }, []);

  const onRunClick = () => {
    chrome.runtime.sendMessage(
      { action: "run", payload: { time, timeMult, shouldSave, folderName } },
      (response) => {
        if (response.status === "running") {
          chrome.storage.sync.set({
            settings: { time, timeMult, shouldSave, folderName, folderId },
          });
          setIsRunning(true);
        }
      }
    );
  };

  const onStopClick = () => {
    chrome.runtime.sendMessage({ action: "stop" }, (response) => {
      if (response.status === "stopped") {
        setIsRunning(false);
        chrome.storage.sync.remove("settings");
      }
    });
  };

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

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Настройки: </h2>
        <label>
          <span className="mr-2">Закрывать вкладки через:</span>
          <input
            type="number"
            min="1"
            className="border px-2 mr-2 w-16"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={isRunning}
          />
          <select
            className="border px-2 mr-2 "
            value={timeMult}
            onChange={(e) => setTimeMult(e.target.value)}
            disabled={isRunning}
          >
            <option value={60}>минут</option>
            <option value={60 * 60}>часов</option>
            <option value={60 * 60 * 24}>дней</option>
          </select>
          <span>после последнего захода на вкладку</span>
        </label>

        <div>
          <label>
            <input
              type="checkbox"
              className="mr-1"
              checked={shouldSave}
              onChange={(e) => setShouldSave(e.target.checked)}
              disabled={isRunning}
            />
            Сохранять закрытые вкладки в папку
          </label>
          <label className={`${shouldSave ? "block" : "hidden"} `}>
            название папки{" "}
            <input
              className="border px-2"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              disabled={isRunning}
            />
          </label>
        </div>
        {isRunning ? (
          <button
            onClick={onStopClick}
            className="border p-2 mt-4 uppercase bg-orange-500 hover:bg-orange-700 duration-200 text-white font-medium"
          >
            остановить
          </button>
        ) : (
          <button
            onClick={onRunClick}
            className="border p-2 mt-4 uppercase bg-sky-500 hover:bg-sky-700 duration-200 text-white font-medium"
          >
            Запустить
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
