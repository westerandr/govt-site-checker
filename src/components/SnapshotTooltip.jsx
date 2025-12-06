const SnapshotTooltip = ({ snapshot, loading, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-2 w-80">
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading preview...</span>
          </div>
        ) : snapshot ? (
          <img 
            src={snapshot} 
            alt="Website preview" 
            className="w-full h-auto rounded"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded text-gray-500">
            Preview not available
          </div>
        )}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotTooltip;

