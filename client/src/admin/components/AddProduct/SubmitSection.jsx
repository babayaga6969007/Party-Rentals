export default function SubmitSection({
  isSubmitting,
  variationUploadProgress,
  isEditMode,
}) {
  return (
    <>
      {variationUploadProgress != null && variationUploadProgress.total > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uploading variation images… {variationUploadProgress.completed} of{" "}
            {variationUploadProgress.total} completed
          </p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${(variationUploadProgress.completed / variationUploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-black text-white rounded-xl text-lg font-medium hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {variationUploadProgress != null
              ? `Uploading variations… ${variationUploadProgress.completed}/${variationUploadProgress.total}`
              : isEditMode
                ? "Updating…"
                : "Creating…"}
          </>
        ) : (
          isEditMode ? "Update Product" : "Add Product"
        )}
      </button>
    </>
  );
}
