const SignageHeader = ({ isSharedView, sharedSignage, onBack }) => {
  return (
    <div className="mb-6 sticky top-24 z-10 bg-gray-50 pb-2">
      <button
        onClick={onBack}
        className="text-[#8B5C42] hover:text-[#704A36] font-medium text-base flex items-center gap-2 transition-all duration-200 hover:bg-[#FFF7F0] px-3 py-1.5 rounded-lg hover:scale-105"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      {isSharedView && sharedSignage && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Views: {sharedSignage.metadata?.viewCount || 0}
          </p>
        </div>
      )}
    </div>
  );
};

export default SignageHeader;
