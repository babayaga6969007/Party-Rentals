export default function DescriptionSection({ description, setDescription }) {
  return (
    <div>
      <label className="font-medium">Description</label>
      <textarea
        className="w-full p-3 border border-gray-400 rounded-lg mt-2 min-h-[120px] resize-y"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Usage instructions, notes, details..."
      />
    </div>
  );
}
