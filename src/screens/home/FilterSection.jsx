"use client";

import Accordion from "@/components/ui/Accordion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FilterSection = ({ productTypes }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentParams = new URLSearchParams(searchParams.toString());
  const openAccordion = currentParams.get("openAccordion")?.split(",") || [];

  const getFilterArray = (key) =>
    currentParams.get(key)?.split(",").filter(Boolean) || [];

  const filters = {
    productTypeId: getFilterArray("productTypeId"),
    weight: getFilterArray("weight"),
    width: getFilterArray("width"),
    yarnNumber: getFilterArray("yarnNumber"),
    technics: getFilterArray("technics"),
    style: getFilterArray("style"),
    pattern: getFilterArray("pattern"),
  };

  const updateSearchParams = (newParams) => {
    if (!mounted) return;

    const updatedParams = new URLSearchParams(currentParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value || value === "all" || value.length === 0) {
        updatedParams.delete(key);
      } else {
        updatedParams.set(key, Array.isArray(value) ? value.join(",") : value);
      }
    });

    router.replace(`/?${updatedParams.toString()}`, {
      scroll: false,
      shallow: true,
    });
  };

  const toggleFilterValue = (key, value) => {
    let current = getFilterArray(key);

    if (value === "all") {
      updateSearchParams({ [key]: [] });
      return;
    }

    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    updateSearchParams({ [key]: updated });
  };

  const renderCheckboxGroup = (items, keyPrefix, key) => {
    const selectedValues = filters[key];

    return (
      <div className="flex flex-col gap-1.5 pt-2">
        {items.map((item) => {
          const isAll = item.value === "all";
          const isChecked = isAll
            ? selectedValues.length === 0
            : selectedValues.includes(item.value);

          return (
            <div key={item.value} className="relative">
              <input
                type="checkbox"
                id={`${keyPrefix}-${item.value}`}
                className="hidden peer"
                checked={isChecked}
                onChange={() => toggleFilterValue(key, item.value)}
                disabled={!mounted}
              />
              <label
                htmlFor={`${keyPrefix}-${item.value}`}
                className={`
                  flex items-center w-full px-3 py-2 text-sm rounded-lg border cursor-pointer transition-all duration-150
                  ${
                    isChecked
                      ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }
                  ${isAll ? "font-semibold border-gray-300" : ""}
                `}
              >
                <span className="flex-1">{item.label}</span>
                {isChecked && !isAll && (
                  <svg
                    className="w-4 h-4 text-blue-600 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  const handleAccordion = (value) => {
    const newOpen = openAccordion.includes(value)
      ? openAccordion.filter((v) => v !== value)
      : [...openAccordion, value];

    updateSearchParams({ openAccordion: newOpen });
  };

  const WeightItems = [
    { label: "All", value: "all" },
    { label: "Lightweight", value: "light" },
    { label: "Medium", value: "medium" },
    { label: "Heavy", value: "heavy" },
  ];

  const WidthItems = [
    { label: "All", value: "all" },
    { label: "36 inch", value: "36" },
    { label: "45 inch", value: "45" },
    { label: "60 inch", value: "60" },
  ];

  const YarnNumberItems = [
    { label: "All", value: "all" },
    { label: "20s", value: "20s" },
    { label: "30s", value: "30s" },
    { label: "40s", value: "40s" },
  ];

  const TechnicsItems = [
    { label: "All", value: "all" },
    { label: "Knitted", value: "knitted" },
    { label: "Woven", value: "woven" },
    { label: "Nonwoven", value: "nonwoven" },
  ];

  const StyleItems = [
    { label: "All", value: "all" },
    { label: "Plain", value: "plain" },
    { label: "Striped", value: "striped" },
    { label: "Jacquard", value: "jacquard" },
  ];

  const PatternItems = [
    { label: "All", value: "all" },
    { label: "Solid", value: "solid" },
    { label: "Printed", value: "printed" },
    { label: "Embroidered", value: "embroidered" },
  ];

  const resetAllFilters = () => {
    const paramsToReset = [
      "productTypeId",
      "weight",
      "width",
      "yarnNumber",
      "technics",
      "style",
      "pattern",
      "openAccordion",
    ];

    const resetParams = {};
    paramsToReset.forEach((param) => (resetParams[param] = []));

    updateSearchParams(resetParams);
  };

  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white h-fit sticky top-6 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              disabled={!mounted}
            >
              Reset
            </button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Active filters:</span>
            <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {activeFilterCount}
            </span>
          </div>
        )}
      </div>

      {/* Accordion Filters */}
      <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
        <Accordion
          title="Category"
          isOpened={openAccordion.includes("category")}
          type="category"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(productTypes, "category", "productTypeId")}
        </Accordion>

        <Accordion
          title="Weight"
          isOpened={openAccordion.includes("weight")}
          type="weight"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(WeightItems, "weight", "weight")}
        </Accordion>

        <Accordion
          title="Width"
          isOpened={openAccordion.includes("width")}
          type="width"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(WidthItems, "width", "width")}
        </Accordion>

        <Accordion
          title="Yarn Number"
          isOpened={openAccordion.includes("yarn")}
          type="yarn"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(YarnNumberItems, "yarn", "yarnNumber")}
        </Accordion>

        <Accordion
          title="Technics"
          isOpened={openAccordion.includes("technics")}
          type="technics"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(TechnicsItems, "technics", "technics")}
        </Accordion>

        <Accordion
          title="Style"
          isOpened={openAccordion.includes("style")}
          type="style"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(StyleItems, "style", "style")}
        </Accordion>

        <Accordion
          title="Pattern"
          isOpened={openAccordion.includes("pattern")}
          type="pattern"
          handleAccordion={handleAccordion}
        >
          {renderCheckboxGroup(PatternItems, "pattern", "pattern")}
        </Accordion>
      </div>
    </div>
  );
};

export default FilterSection;
