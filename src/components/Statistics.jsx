import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
  Legend,
} from "recharts";
import useGetTabs from "./hooks/useGetTabs";
import { useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const COLORS = [
  "rgb(16 185 129)",
  "rgb(14 165 233)",
  "rgb(249 115 22)",
  "rgb(239 68 68)",
];

const customLegend = (props) => {
  const { payload } = props;

  return (
    <ul className="text-left flex flex-col gap-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex gap-2 items-center">
          <div
            className="w-3 h-3"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm text-slate-500">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function Statistics() {
  const tabs = useGetTabs();
  const [data, setData] = useState([]);
  const [step, setStep] = useState("hours");
  const { t } = useTranslation();

  useEffect(() => {
    let data = [];
    if (step === "days") {
      data = [
        { name: `≤ 1 ${t("statistics.day")}`, value: 0 },
        { name: `> 1 ${t("statistics.day")}`, value: 0 },
        { name: `> 7 ${t("statistics.days")}`, value: 0 },
        { name: `> 30 ${t("statistics.days")}`, value: 0 },
      ];
    } else if (step === "hours") {
      data = [
        { name: `≤ 6 ${t("statistics.hours")}`, value: 0 },
        { name: `> 6 ${t("statistics.hours")}`, value: 0 },
        { name: `> 12 ${t("statistics.hours")}`, value: 0 },
        { name: `> 24 ${t("statistics.hours")}`, value: 0 },
      ];
    }
    for (const tab of tabs) {
      const diff = Date.now() - tab.lastAccessed;
      if (step === "days") {
        if (diff <= 24 * 60 * 60 * 1000) {
          data[0].value += 1;
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
          data[1].value += 1;
        } else if (diff < 30 * 7 * 24 * 60 * 60 * 1000) {
          data[2].value += 1;
        } else {
          data[3].value += 1;
        }
      } else if (step === "hours") {
        if (diff <= 6 * 60 * 1000) {
          data[0].value += 1;
        } else if (diff < 12 * 60 * 1000) {
          data[1].value += 1;
        } else if (diff < 24 * 60 * 60 * 1000) {
          data[2].value += 1;
        } else {
          data[3].value += 1;
        }
      }
    }
    setData(data);
  }, [tabs, step]);

  return (
    <>
      <p className="text-sm text-center mb-2">
        {t("statistics.howLongActive")}
      </p>
      <select
        className="border px-2 mx-auto text-sm max-w-32"
        value={step}
        onChange={(e) => setStep(e.target.value)}
      >
        <option value="hours">{t("statistics.byHours")}</option>
        <option value="days">{t("statistics.byDays")}</option>
      </select>
      <ResponsiveContainer width={"100%"} height={200} className="mx-4">
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            animationBegin={50}
            animationDuration={400}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ outline: "none" }}
              />
            ))}
            <LabelList dataKey="value" position="top" />
          </Pie>
          <Legend
            verticalAlign="middle"
            align="right"
            width={120}
            iconSize={12}
            content={customLegend}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}
