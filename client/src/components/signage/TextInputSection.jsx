import { memo } from "react";
import { useSignage } from "../../context/SignageContext";

const TextInputSection = memo(() => {
  const { textContent, setTextContent } = useSignage();

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
        Text
      </h3>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Enter your text here...&#10;Each new line will appear on a new line"
        rows={6}
        className="w-full p-3 border rounded-lg resize-none"
      />
    </div>
  );
});

TextInputSection.displayName = "TextInputSection";

export default TextInputSection;
