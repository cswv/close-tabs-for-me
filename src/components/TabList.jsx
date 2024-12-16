import useGetTabs from "./hooks/useGetTabs";
import { useTranslation } from "react-i18next";

export default function TabList() {
  const tabs = useGetTabs();
  const { t } = useTranslation();

  const closeTab = (index) => {
    chrome.tabs.remove(tabs[index].id);
  };

  return (
    <ul className="flex flex-col pl-2">
      {tabs.map((tab, index) => (
        <li
          key={tab.id}
          className={`flex ${index === tabs.length - 1 ? "" : "border-b"}`}
        >
          {tab.favIconUrl ? (
            <img
              src={tab.favIconUrl}
              width={16}
              height={16}
              className="self-center mr-2"
            />
          ) : (
            <div className="self-center mr-2 bg-slate-200 w-4 h-4"></div>
          )}
          <div className="flex flex-col py-2">
            <span className="truncate max-w-64 text-sm" title={tab.title}>
              {tab.title}
            </span>
            <span className="text-xs">
              {new Date(tab.lastAccessed).toLocaleString()}
            </span>
          </div>
          <button
            className="px-3 py-1 ml-auto hover:bg-slate-200 duration-200  text-sm"
            title={t("tabList.goTo")}
            onClick={() => chrome.tabs.update(tab.id, { active: true })}
          >
            ➔
          </button>
          <button
            className="px-3 py-1 hover:bg-slate-200 duration-200 "
            title={t("tabList.close")}
            onClick={() => closeTab(index)}
          >
            ⨯
          </button>
        </li>
      ))}
    </ul>
  );
}
