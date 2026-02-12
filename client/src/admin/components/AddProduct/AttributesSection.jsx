export default function AttributesSection({
  attributeGroups,
  attrLoading,
  selectedAttrs,
  setSelectedAttrs,
  selectedAddons,
  setSelectedAddons,
  paintConfigByGroup,
  setPaintConfigByGroup,
  shelvingConfig,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Attributes</h2>
      {attrLoading ? (
        <p className="text-gray-600">Loading attributes...</p>
      ) : attributeGroups.length === 0 ? (
        <p className="text-gray-600">No attributes found. Create them in Admin → Attributes.</p>
      ) : (
        attributeGroups.map((g) => {
          const options = (g.options || []).filter((o) => o.isActive !== false);
          const isAddon = g.type === "addon";
          const groupIdStr = String(g._id);
          const isSingle = g.type === "select";
          const isColor = g.type === "color";
          const isPaint = g.type === "paint";
          const required = !!g.required;
          const current = selectedAttrs[String(g._id)] || [];

          const toggleOption = (optionId) => {
            setSelectedAttrs((prev) => {
              const key = String(g._id);
              const prevList = prev[key] || [];
              let nextList = prevList;
              if (isSingle) {
                nextList = prevList.includes(optionId) ? [] : [optionId];
              } else {
                nextList = prevList.includes(optionId)
                  ? prevList.filter((id) => id !== optionId)
                  : [...prevList, optionId];
              }
              return { ...prev, [key]: nextList };
            });
          };

          const shelvingTierAOptions = shelvingConfig?.tierA?.sizes || [];

          return (
            <div key={g._id} className="border border-gray-300 rounded-xl p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium">
                  {g.name} {required && <span className="text-red-600">*</span>}
                </label>
                <span className="text-xs text-gray-500">
                  {g.type === "multi" && "Multi-select"}
                  {g.type === "select" && "Single-select"}
                  {g.type === "color" && "Color"}
                  {g.type === "paint" && "Paint"}
                  {g.type === "addon" && "Add-on"}
                </span>
              </div>

              {isAddon ? (
                <div className="space-y-3">
                  {options.map((o) => {
                    const oid = String(o._id || o.optionId || o);
                    const groupKey = String(g._id);
                    const isSelected = !!selectedAddons[groupKey]?.[oid]?.selected;
                    const overridePrice = selectedAddons[groupKey]?.[oid]?.overridePrice ?? "";
                    const shelvingTier = selectedAddons[groupKey]?.[oid]?.shelvingTier || (o.tier || "A");
                    const shelvingSize = selectedAddons[groupKey]?.[oid]?.shelvingSize || "";
                    const shelvingQuantity = selectedAddons[groupKey]?.[oid]?.shelvingQuantity || 1;
                    const shelvingPriceOverrides = selectedAddons[groupKey]?.[oid]?.shelvingPriceOverrides || null;
                    const useShelvingPriceOverride = !!(
                      (shelvingPriceOverrides?.tierA?.sizes?.length > 0) ||
                      (shelvingPriceOverrides?.tierB != null && shelvingPriceOverrides.tierB.price >= 0) ||
                      (shelvingPriceOverrides?.tierC != null && shelvingPriceOverrides.tierC.price >= 0)
                    );
                    const isShelving =
                      o.label?.toLowerCase().includes("shelving") || o.label?.toLowerCase().includes("shelf");
                    const isPedestal = o.label?.toLowerCase().includes("pedestal");

                    return (
                      <div
                        key={o._id}
                        className={`flex flex-col gap-3 p-3 rounded-lg border ${
                          isSelected ? "border-black bg-gray-50" : "border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedAddons((prev) => ({
                                  ...prev,
                                  [groupKey]: {
                                    ...(prev[groupKey] || {}),
                                    [oid]: {
                                      selected: checked,
                                      overridePrice: prev[groupKey]?.[oid]?.overridePrice ?? "",
                                      shelvingTier: prev[groupKey]?.[oid]?.shelvingTier || (o.tier || "A"),
                                      shelvingSize: prev[groupKey]?.[oid]?.shelvingSize || "",
                                      shelvingQuantity: prev[groupKey]?.[oid]?.shelvingQuantity || 1,
                                      pedestalCount: prev[groupKey]?.[oid]?.pedestalCount || 0,
                                      pedestals: prev[groupKey]?.[oid]?.pedestals || [],
                                    },
                                  },
                                }));
                              }}
                            />
                            <div>
                              <div className="font-medium">{o.label}</div>
                              <div className="text-sm text-gray-600">
                                Base: ${Number(o.priceDelta || 0).toFixed(2)}
                                {o.tier && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                    Tier {o.tier}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Override price</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              disabled={!isSelected}
                              value={overridePrice}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedAddons((prev) => ({
                                  ...prev,
                                  [groupKey]: {
                                    ...(prev[groupKey] || {}),
                                    [oid]: { ...prev[groupKey]?.[oid], selected: true, overridePrice: value === "" ? "" : Number(value) },
                                  },
                                }));
                              }}
                              className="w-36 p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                              placeholder={`${Number(o.priceDelta || 0).toFixed(0)}`}
                            />
                          </div>
                        </div>

                        {isPedestal && isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-300 space-y-4">
                            <h4 className="font-semibold text-sm text-gray-700">Pedestal Configuration</h4>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                How many pedestals would you require?
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={selectedAddons[groupKey]?.[oid]?.pedestalCount || 0}
                                onChange={(e) => {
                                  const count = Number(e.target.value) || 0;
                                  setSelectedAddons((prev) => {
                                    const groupData = prev[groupKey] || {};
                                    const existing = groupData[oid] || {};
                                    return {
                                      ...prev,
                                      [groupKey]: {
                                        ...groupData,
                                        [oid]: {
                                          ...existing,
                                          selected: true,
                                          pedestalCount: count,
                                          pedestals: Array.from({ length: count }, (_, i) =>
                                            existing.pedestals?.[i] || { dimension: "", price: "" }
                                          ),
                                        },
                                      },
                                    };
                                  });
                                }}
                                className="w-32 p-2 border rounded-lg"
                              />
                            </div>
                            {(selectedAddons[groupKey]?.[oid]?.pedestals || []).map((p, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg"
                              >
                                <input
                                  type="text"
                                  placeholder={`Pedestal ${idx + 1} Dimension`}
                                  value={p.dimension}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedAddons((prev) => {
                                      const copy = [...prev[groupKey][oid].pedestals];
                                      copy[idx] = { ...copy[idx], dimension: value };
                                      return {
                                        ...prev,
                                        [groupKey]: {
                                          ...prev[groupKey],
                                          [oid]: { ...prev[groupKey][oid], pedestals: copy },
                                        },
                                      };
                                    });
                                  }}
                                  className="p-2 border rounded-lg"
                                />
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={p.price}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedAddons((prev) => {
                                      const copy = [...prev[groupKey][oid].pedestals];
                                      copy[idx] = { ...copy[idx], price: value };
                                      return {
                                        ...prev,
                                        [groupKey]: {
                                          ...prev[groupKey],
                                          [oid]: { ...prev[groupKey][oid], pedestals: copy },
                                        },
                                      };
                                    });
                                  }}
                                  className="p-2 border rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {isShelving && isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                            <h4 className="font-semibold text-sm text-gray-700">Shelving — select tier</h4>
                            <div className="flex gap-3">
                              {["A", "B", "C"].map((tier) => (
                                <button
                                  key={tier}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAddons((prev) => ({
                                      ...prev,
                                      [groupKey]: {
                                        ...(prev[groupKey] || {}),
                                        [oid]: {
                                          ...prev[groupKey]?.[oid],
                                          selected: true,
                                          shelvingTier: tier,
                                          shelvingSize: tier === "A" ? "" : "yes",
                                          shelvingQuantity: 1,
                                        },
                                      },
                                    }));
                                  }}
                                  className={`px-4 py-2 rounded-lg border-2 transition ${
                                    shelvingTier === tier
                                      ? "border-black bg-gray-50 text-black font-semibold"
                                      : "border-gray-300 hover:border-gray-400"
                                  }`}
                                >
                                  Tier {tier}
                                </button>
                              ))}
                            </div>
                            {shelvingTier && (
                              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {shelvingTier === "A" && (
                                  <>
                                    Tier A: multiple sizes available.{" "}
                                    {shelvingTierAOptions.length
                                      ? `${shelvingTierAOptions.map((o) => o.size).join(", ")} — see Shelving Config for dimensions & pricing.`
                                      : "Configure in Admin → Shelving Config."}
                                  </>
                                )}
                                {shelvingTier === "B" && (
                                  <>
                                    {shelvingConfig?.tierB?.dimensions || '43" wide x 11.5" deep x 1.5" thick'} — $
                                    {shelvingConfig?.tierB?.price ?? 29}/shelf (info only)
                                  </>
                                )}
                                {shelvingTier === "C" && (
                                  <>
                                    {shelvingConfig?.tierC?.dimensions || '75" wide x 25" deep x 1.5" thick'} — $
                                    {shelvingConfig?.tierC?.price ?? 50}/shelf, max 1 (info only)
                                  </>
                                )}
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={useShelvingPriceOverride}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedAddons((prev) => {
                                      const current = prev[groupKey]?.[oid] || {};
                                      const baseSizes = shelvingConfig?.tierA?.sizes || [];
                                      return {
                                        ...prev,
                                        [groupKey]: {
                                          ...(prev[groupKey] || {}),
                                          [oid]: {
                                            ...current,
                                            selected: true,
                                            shelvingPriceOverrides: checked
                                              ? {
                                                  tierA: {
                                                    sizes:
                                                      current.shelvingPriceOverrides?.tierA?.sizes?.length > 0
                                                        ? current.shelvingPriceOverrides.tierA.sizes
                                                        : baseSizes.map((s) => ({
                                                            size: s.size,
                                                            dimensions: s.dimensions || "",
                                                            price: s.price,
                                                          })),
                                                  },
                                                  tierB: {
                                                    price:
                                                      current.shelvingPriceOverrides?.tierB?.price ??
                                                      shelvingConfig?.tierB?.price ??
                                                      29,
                                                  },
                                                  tierC: {
                                                    price:
                                                      current.shelvingPriceOverrides?.tierC?.price ??
                                                      shelvingConfig?.tierC?.price ??
                                                      50,
                                                  },
                                                }
                                              : null,
                                          },
                                        },
                                      };
                                    });
                                  }}
                                />
                                <span className="font-medium text-sm text-gray-700">
                                  Override shelving pricing for this product
                                </span>
                              </label>
                              {useShelvingPriceOverride && shelvingTier && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                  {shelvingTier === "A" &&
                                    (shelvingPriceOverrides?.tierA?.sizes || shelvingTierAOptions).map(
                                      (s, idx) => (
                                        <div key={s.size || idx} className="inline-flex items-center gap-2">
                                          <span className="text-sm text-gray-600">{s.size}</span>
                                          <span className="text-gray-400">$</span>
                                          <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={
                                              (shelvingPriceOverrides?.tierA?.sizes || shelvingTierAOptions)[idx]
                                                ?.price ?? s.price ?? ""
                                            }
                                            onChange={(ev) => {
                                              const val = ev.target.value === "" ? "" : Number(ev.target.value);
                                              setSelectedAddons((prev) => {
                                                const sizes = [
                                                  ...(prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierA
                                                    ?.sizes ||
                                                    shelvingTierAOptions.map((x) => ({
                                                      size: x.size,
                                                      dimensions: x.dimensions || "",
                                                      price: x.price,
                                                    }))),
                                                ];
                                                if (sizes[idx] == null)
                                                  sizes[idx] = {
                                                    size: s.size,
                                                    dimensions: s.dimensions || "",
                                                    price: s.price,
                                                  };
                                                sizes[idx] = { ...sizes[idx], price: val === "" ? 0 : val };
                                                return {
                                                  ...prev,
                                                  [groupKey]: {
                                                    ...(prev[groupKey] || {}),
                                                    [oid]: {
                                                      ...prev[groupKey]?.[oid],
                                                      selected: true,
                                                      shelvingPriceOverrides: {
                                                        ...prev[groupKey]?.[oid]?.shelvingPriceOverrides,
                                                        tierA: { sizes },
                                                        tierB:
                                                          prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierB || {
                                                            price: shelvingConfig?.tierB?.price ?? 29,
                                                          },
                                                        tierC:
                                                          prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierC || {
                                                            price: shelvingConfig?.tierC?.price ?? 50,
                                                          },
                                                      },
                                                    },
                                                  },
                                                };
                                              });
                                            }}
                                            className="w-20 p-1.5 border border-gray-300 rounded text-sm"
                                          />
                                          <span className="text-xs text-gray-400">/shelf</span>
                                        </div>
                                      )
                                    )}
                                  {shelvingTier === "B" && (
                                    <div className="inline-flex items-center gap-2">
                                      <span className="text-sm text-gray-600">Tier B</span>
                                      <span className="text-gray-400">$</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                          shelvingPriceOverrides?.tierB?.price ??
                                          shelvingConfig?.tierB?.price ??
                                          29
                                        }
                                        onChange={(ev) => {
                                          const val = ev.target.value === "" ? "" : Number(ev.target.value);
                                          setSelectedAddons((prev) => ({
                                            ...prev,
                                            [groupKey]: {
                                              ...(prev[groupKey] || {}),
                                              [oid]: {
                                                ...prev[groupKey]?.[oid],
                                                selected: true,
                                                shelvingPriceOverrides: {
                                                  ...prev[groupKey]?.[oid]?.shelvingPriceOverrides,
                                                  tierA:
                                                    prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierA || {
                                                      sizes: shelvingTierAOptions.map((x) => ({
                                                        size: x.size,
                                                        dimensions: x.dimensions || "",
                                                        price: x.price,
                                                      })),
                                                    },
                                                  tierB: { price: val === "" ? 0 : val },
                                                  tierC:
                                                    prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierC || {
                                                      price: shelvingConfig?.tierC?.price ?? 50,
                                                    },
                                                },
                                              },
                                            },
                                          }));
                                        }}
                                        className="w-20 p-1.5 border border-gray-300 rounded text-sm"
                                      />
                                      <span className="text-xs text-gray-400">/shelf</span>
                                    </div>
                                  )}
                                  {shelvingTier === "C" && (
                                    <div className="inline-flex items-center gap-2">
                                      <span className="text-sm text-gray-600">Tier C</span>
                                      <span className="text-gray-400">$</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                          shelvingPriceOverrides?.tierC?.price ??
                                          shelvingConfig?.tierC?.price ??
                                          50
                                        }
                                        onChange={(ev) => {
                                          const val = ev.target.value === "" ? "" : Number(ev.target.value);
                                          setSelectedAddons((prev) => ({
                                            ...prev,
                                            [groupKey]: {
                                              ...(prev[groupKey] || {}),
                                              [oid]: {
                                                ...prev[groupKey]?.[oid],
                                                selected: true,
                                                shelvingPriceOverrides: {
                                                  ...prev[groupKey]?.[oid]?.shelvingPriceOverrides,
                                                  tierA:
                                                    prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierA || {
                                                      sizes: shelvingTierAOptions.map((x) => ({
                                                        size: x.size,
                                                        dimensions: x.dimensions || "",
                                                        price: x.price,
                                                      })),
                                                    },
                                                  tierB:
                                                    prev[groupKey]?.[oid]?.shelvingPriceOverrides?.tierB || {
                                                      price: shelvingConfig?.tierB?.price ?? 29,
                                                    },
                                                  tierC: { price: val === "" ? 0 : val },
                                                },
                                              },
                                            },
                                          }));
                                        }}
                                        className="w-20 p-1.5 border border-gray-300 rounded text-sm"
                                      />
                                      <span className="text-xs text-gray-400">/shelf</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {options.map((o) => {
                      const oid = String(o._id);
                      const active = current.includes(oid);
                      return (
                        <button
                          type="button"
                          key={o._id}
                          onClick={() => toggleOption(o._id)}
                          className={`rounded-xl border transition
                            ${active ? "bg-black text-white border-black ring-2 ring-black ring-offset-1" : "bg-white border-gray-300 hover:bg-gray-100"}
                            ${isPaint ? "flex flex-col items-center gap-1.5 p-2" : "inline-flex items-center gap-2 px-4 py-2"}
                          `}
                          title={o.label}
                        >
                          {isPaint && (o.imageUrl || o.value) ? (
                            <>
                              <span className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex shrink-0">
                                <img
                                  src={o.imageUrl || `/paint/${o.value}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </span>
                              <span className="text-xs font-medium text-center">{o.label}</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              {isColor && (
                                <span
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: o.hex || "#000" }}
                                />
                              )}
                              {o.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {isPaint && (
                    <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">Paint options (this product)</h4>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!paintConfigByGroup[groupIdStr]?.allowMultiple}
                          onChange={(e) => {
                            setPaintConfigByGroup((prev) => ({
                              ...prev,
                              [groupIdStr]: {
                                ...prev[groupIdStr],
                                allowMultiple: e.target.checked,
                                price: prev[groupIdStr]?.price ?? "",
                                pricePerAddition: prev[groupIdStr]?.pricePerAddition ?? "",
                              },
                            }));
                          }}
                        />
                        <span className="text-sm text-gray-700">Allow multiple selection</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-0.5">Price ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paintConfigByGroup[groupIdStr]?.price ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPaintConfigByGroup((prev) => ({
                                ...prev,
                                [groupIdStr]: {
                                  ...prev[groupIdStr],
                                  price: v === "" ? "" : Number(v),
                                  allowMultiple: !!prev[groupIdStr]?.allowMultiple,
                                  pricePerAddition: prev[groupIdStr]?.pricePerAddition ?? "",
                                },
                              }));
                            }}
                            placeholder="0"
                            className="w-24 p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-0.5">Price per addition ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paintConfigByGroup[groupIdStr]?.pricePerAddition ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPaintConfigByGroup((prev) => ({
                                ...prev,
                                [groupIdStr]: {
                                  ...prev[groupIdStr],
                                  pricePerAddition: v === "" ? "" : Number(v),
                                  allowMultiple: !!prev[groupIdStr]?.allowMultiple,
                                  price: prev[groupIdStr]?.price ?? "",
                                },
                              }));
                            }}
                            placeholder="0"
                            className="w-24 p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        First paint = Price; each additional = Price per addition (when multiple allowed).
                      </p>
                    </div>
                  )}
                </>
              )}

              {required && !isAddon && (
                <p className="text-xs text-gray-500 mt-3">Required: select at least one option.</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
