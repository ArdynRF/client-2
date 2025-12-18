"use client";

import Accordion from "@/components/ui/Accordion";
import { useRouter, useSearchParams } from "next/navigation";

const FilterSection = ({ productTypes }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams.toString());

  const openAccordion = currentParams.get("openAccordion")?.split(",") || [];

  // Mengambil filter sebagai array string dari URL
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
      <div className="flex flex-wrap gap-3 pt-2">
        {items.map((item) => {
          const isAll = item.value === "all";
          const isChecked = isAll
            ? selectedValues.length === 0
            : selectedValues.includes(item.value);

          return (
            <div key={item.value}>
              <input
                type="checkbox"
                id={`${keyPrefix}-${item.value}`}
                className="hidden peer"
                checked={isChecked}
                onChange={() => toggleFilterValue(key, item.value)}
              />
              <label
                htmlFor={`${keyPrefix}-${item.value}`}
                className="checkbox-button-label"
              >
                {item.label}
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

  return (
    <div className="rounded-lg shadow-lg space-y-3 p-5 bg-white h-fit">
      <h1 className="text-2xl mb-8 font-semibold">Filters</h1>

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
        title="Number of yarn"
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
  );
};

export default FilterSection;
