// Comprehensive LED Display Form Content
export const renderFormFields = (
  formData: any,
  setFormData: any,
  isDarkMode: boolean = false,
  screenParamSuggestions?: { [key: string]: string[] }
) => {
  // Dynamic class names based on dark mode
  const labelClass = `block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`;
  const labelSmallClass = `block text-xs font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    isDarkMode 
      ? 'bg-gray-800 border border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400/20' 
      : 'bg-white border-2 border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-gray-200'
  }`;
  const sectionHeaderClass = `text-xl font-bold mb-4 pb-3 border-b-2 ${isDarkMode ? 'text-white border-white/20' : 'text-gray-900 border-gray-300'}`;
  const descriptionClass = `text-sm mb-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const variantBoxClass = `flex items-center gap-3 p-4 rounded-lg border-2 ${isDarkMode ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-300 shadow-sm'}`;

  const renderSuggestionChips = (values: string[] | undefined, onSelect: (value: string) => void) => {
    if (!values || values.length === 0) return null;
    return (
      <div className="mt-1 flex flex-wrap gap-1 text-xs">
        {values.slice(0, 8).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onSelect(val)}
            className={`px-2 py-1 rounded-full border transition-colors ${
              isDarkMode
                ? 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700'
                : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    );
  };
  
  return (
  <>
    {/* Basic Information */}
    <div>
      <h3 className={sectionHeaderClass}>Basic Information</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Image URL 1 (Front)</label>
          <input
            type="text"
            placeholder="https://..."
            value={formData.images?.[0] || ""}
            onChange={(e) => {
              const newImages = [...(formData.images || [])];
              if (e.target.value) {
                newImages[0] = e.target.value;
              } else {
                newImages.splice(0, 1);
              }
              setFormData({
                ...formData,
                images: newImages,
              });
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Image URL 2 (Back)</label>
          <input
            type="text"
            placeholder="https://..."
            value={formData.images?.[1] || ""}
            onChange={(e) => {
              const newImages = [...(formData.images || [])];
              if (e.target.value) {
                newImages[1] = e.target.value;
              } else {
                newImages.splice(1, 1);
              }
              setFormData({
                ...formData,
                images: newImages,
              });
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input
            type="text"
            value={formData.category || ""}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Application</label>
          <input
            type="text"
            placeholder="e.g., Indoor/Outdoor"
            value={formData.application || ""}
            onChange={(e) => setFormData({ ...formData, application: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>IP Rating</label>
          <input
            type="text"
            placeholder="e.g., IP65"
            value={formData.ipRating || ""}
            onChange={(e) => setFormData({ ...formData, ipRating: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Pixel Pitch</label>
          <input
            type="text"
            placeholder="e.g., P2.5"
            value={formData.pixelPitch || ""}
            onChange={(e) => setFormData({ ...formData, pixelPitch: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Total Resolution</label>
          <input
            type="text"
            placeholder="e.g., 1920x1080"
            value={formData.totalResolution || ""}
            onChange={(e) => setFormData({ ...formData, totalResolution: e.target.value })}
            className={inputClass}
          />
        </div>
        {/* Square Feet field hidden as requested */}
        {formData.__context !== 'cart' && (
          <div>
            <label className={labelClass}>Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price ?? ""}
              onChange={(e) => setFormData({ ...formData, price: e.target.value === "" ? undefined : Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        )}
      </div>
    </div>

    {/* Cabinet Material Variants */}
    <div>
      <h3 className={sectionHeaderClass}>Cabinet Material Variants</h3>
      <p className={descriptionClass}>Add multiple cabinet material options with their respective prices. This allows the same display specification to have different prices based on cabinet material.</p>
      
      <div className="space-y-3">
        {(formData.cabinetMaterialVariants || []).map((variant: any, index: number) => (
          <div key={index} className={variantBoxClass}>
            <div className="flex-1">
              <label className={labelSmallClass}>Material</label>
              <select
                value={variant.material || ""}
                onChange={(e) => {
                  const updated = [...(formData.cabinetMaterialVariants || [])];
                  updated[index] = { ...updated[index], material: e.target.value };
                  setFormData({ ...formData, cabinetMaterialVariants: updated });
                }}
                className={inputClass}
              >
                <option value="" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Select Material</option>
                <option value="Die Cast Aluminium" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Die Cast Aluminium</option>
                <option value="Aluminium" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Aluminium</option>
                <option value="Mild Steel" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Mild Steel</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelSmallClass}>Price (USD per sq.m)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 150"
                value={variant.price ?? ""}
                onChange={(e) => {
                  const updated = [...(formData.cabinetMaterialVariants || [])];
                  updated[index] = { ...updated[index], price: e.target.value === "" ? undefined : Number(e.target.value) };
                  setFormData({ ...formData, cabinetMaterialVariants: updated });
                }}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelSmallClass}>Cabinet Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 15"
                value={variant.cabinetWeight ?? ""}
                onChange={(e) => {
                  const updated = [...(formData.cabinetMaterialVariants || [])];
                  updated[index] = { ...updated[index], cabinetWeight: e.target.value === "" ? undefined : Number(e.target.value) };
                  setFormData({ ...formData, cabinetMaterialVariants: updated });
                }}
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = (formData.cabinetMaterialVariants || []).filter((_: any, i: number) => i !== index);
                setFormData({ ...formData, cabinetMaterialVariants: updated });
              }}
              className="mt-5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => {
            const updated = [...(formData.cabinetMaterialVariants || []), { material: "", price: "", cabinetWeight: "" }];
            setFormData({ ...formData, cabinetMaterialVariants: updated });
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Material Variant
        </button>
        
        {formData.cabinetMaterialVariants && formData.cabinetMaterialVariants.length > 0 && (
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            💡 Tip: Make sure to select a material and enter a price for each variant before saving. Empty variants will be automatically removed.
          </p>
        )}
      </div>
    </div>

    {/* Module Specifications */}
    <div>
      <h3 className={sectionHeaderClass}>Module Specifications</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>1. Pixel Pitch</label>
          <input
            type="text"
            placeholder="e.g., P2.5"
            value={formData.moduleSpecs?.pixelPitch || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              moduleSpecs: { ...formData.moduleSpecs, pixelPitch: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>2. Pixel Configuration</label>
          <input
            type="text"
            placeholder="Auto-copied from Screen Resolution"
            value={formData.moduleSpecs?.pixelConfiguration || formData.totalResolution || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              moduleSpecs: { ...formData.moduleSpecs, pixelConfiguration: e.target.value }
            })}
            className={inputClass}
          />
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            💡 Auto-synced from Screen Resolution (Total Resolution)
          </p>
        </div>
        <div>
          <label className={labelClass}>3. Module Resolution</label>
          <input
            type="text"
            placeholder="e.g., 64x64"
            value={formData.moduleSpecs?.moduleResolution || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              moduleSpecs: { ...formData.moduleSpecs, moduleResolution: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>4. Module Size (mm)</label>
          <input
            type="text"
            placeholder="e.g., 320x160"
            value={formData.moduleSpecs?.moduleSize || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              moduleSpecs: { ...formData.moduleSpecs, moduleSize: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>5. Module Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 0.5"
            value={formData.moduleSpecs?.moduleWeight || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              moduleSpecs: { ...formData.moduleSpecs, moduleWeight: parseFloat(e.target.value) }
            })}
            className={inputClass}
          />
        </div>
      </div>
    </div>

    {/* Cabinet Specifications */}
    <div>
      <h3 className={sectionHeaderClass}>Cabinet Specifications</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>1. Cabinet Size (W*H)</label>
          <input
            type="text"
            placeholder="e.g., 640x480mm"
            value={formData.cabinetSpecs?.cabinetSize || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, cabinetSize: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>2. Cabinet Resolution</label>
          <input
            type="text"
            placeholder="e.g., 128x96"
            value={formData.cabinetSpecs?.cabinetResolution || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, cabinetResolution: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>3. Module Quantity</label>
          <input
            type="number"
            placeholder="e.g., 6"
            value={formData.cabinetSpecs?.moduleQuantity || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, moduleQuantity: parseInt(e.target.value) }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>4. Pixel Density</label>
          <input
            type="text"
            placeholder="e.g., 160000/sqm"
            value={formData.cabinetSpecs?.pixelDensity || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, pixelDensity: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>5. Cabinet Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 15"
            value={formData.cabinetSpecs?.cabinetWeight || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, cabinetWeight: parseFloat(e.target.value) }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>6. Cabinet Area (sqm)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 0.3072"
            value={formData.cabinetSpecs?.cabinetArea || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, cabinetArea: parseFloat(e.target.value) }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>7. Material</label>
          <input
            type="text"
            placeholder="e.g., Die-cast Aluminum"
            value={formData.cabinetSpecs?.material || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, material: e.target.value }
            })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>8. Maintenance</label>
          <select
            value={formData.cabinetSpecs?.maintenance || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              cabinetSpecs: { ...formData.cabinetSpecs, maintenance: e.target.value }
            })}
            className={inputClass}
          >
            <option value="" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Select Maintenance</option>
            <option value="Front" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Front</option>
            <option value="Back" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Back</option>
            <option value="Front/Back" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Front/Back</option>
          </select>
        </div>
      </div>
    </div>

    {/* Screen Parameters */}
    <div>
      <h3 className={sectionHeaderClass}>Screen Parameters</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>1. Brightness Control</label>
          <select
            value={formData.screenParams?.brightnessControl || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, brightnessControl: e.target.value }
            })}
            className={inputClass}
          >
            <option value="" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Select Option</option>
            <option value="Automatic" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Automatic</option>
            <option value="Manual" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Manual</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>2. White Balance Brightness</label>
          <input
            type="text"
            placeholder="e.g., 5000 nits"
            value={formData.screenParams?.whiteBalanceBrightness || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, whiteBalanceBrightness: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.whiteBalanceBrightness,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, whiteBalanceBrightness: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>3. Color Temperature</label>
          <input
            type="text"
            placeholder="e.g., 6500K"
            value={formData.screenParams?.colorTemperature || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, colorTemperature: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.colorTemperature,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, colorTemperature: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>4. Best Viewing Distance</label>
          <input
            type="text"
            placeholder="e.g., 2-50m"
            value={formData.screenParams?.bestViewingDistance || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, bestViewingDistance: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.bestViewingDistance,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, bestViewingDistance: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>5. Brightness Uniformity</label>
          <input
            type="text"
            placeholder="e.g., ≥97%"
            value={formData.screenParams?.brightnessUniformity || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, brightnessUniformity: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.brightnessUniformity,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, brightnessUniformity: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>6. Color Uniformity</label>
          <input
            type="text"
            placeholder="e.g., ≥98%"
            value={formData.screenParams?.colorUniformity || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, colorUniformity: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.colorUniformity,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, colorUniformity: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>7. Protective Grade</label>
          <input
            type="text"
            placeholder="e.g., IP65"
            value={formData.screenParams?.protectiveGrade || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, protectiveGrade: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.protectiveGrade,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, protectiveGrade: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>8. View Angle</label>
          <input
            type="text"
            placeholder="e.g., H:160° V:140°"
            value={formData.screenParams?.viewAngle || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, viewAngle: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.viewAngle,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, viewAngle: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>9. Defects Rate</label>
          <input
            type="text"
            placeholder="e.g., <0.0001%"
            value={formData.screenParams?.defectsRate || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, defectsRate: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.defectsRate,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, defectsRate: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>10. Frame Frequency</label>
          <input
            type="text"
            placeholder="e.g., 60Hz"
            value={formData.screenParams?.frameFrequency || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, frameFrequency: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.frameFrequency,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, frameFrequency: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>11. Refresh Rate</label>
          <select
            value={formData.screenParams?.refreshRate || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, refreshRate: e.target.value }
            })}
            className={inputClass}
          >
            <option value="" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>Select Refresh Rate</option>
            <option value="1920" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>1920 Hz</option>
            <option value="3840" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>3840 Hz</option>
            <option value="7740" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>7740 Hz</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>12. Input Voltage</label>
          <input
            type="text"
            placeholder="e.g., 110-240V AC"
            value={formData.screenParams?.inputVoltage || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, inputVoltage: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.inputVoltage,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, inputVoltage: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>13. Max Power Consumption</label>
          <input
            type="text"
            placeholder="e.g., 800W/sqm"
            value={formData.screenParams?.maxPowerConsumption || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, maxPowerConsumption: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.maxPowerConsumption,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, maxPowerConsumption: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>14. Avg Power Consumption</label>
          <input
            type="text"
            placeholder="e.g., 300W/sqm"
            value={formData.screenParams?.avgPowerConsumption || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, avgPowerConsumption: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.avgPowerConsumption,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, avgPowerConsumption: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>15. Life Span</label>
          <input
            type="text"
            placeholder="e.g., 100000 hours"
            value={formData.screenParams?.lifeSpan || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, lifeSpan: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.lifeSpan,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, lifeSpan: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>16. Temperature-Operating</label>
          <input
            type="text"
            placeholder="e.g., -20°C to 50°C"
            value={formData.screenParams?.temperatureOperating || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, temperatureOperating: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.temperatureOperating,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, temperatureOperating: val },
              })
          )}
        </div>
        <div>
          <label className={labelClass}>17. Humidity-Operating</label>
          <input
            type="text"
            placeholder="e.g., 10%-90%"
            value={formData.screenParams?.humidityOperating || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              screenParams: { ...formData.screenParams, humidityOperating: e.target.value }
            })}
            className={inputClass}
          />
          {renderSuggestionChips(
            screenParamSuggestions?.humidityOperating,
            (val) =>
              setFormData({
                ...formData,
                screenParams: { ...formData.screenParams, humidityOperating: val },
              })
          )}
        </div>
      </div>
    </div>
  </>
  );
};
