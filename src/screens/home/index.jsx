// screens/home/index.jsx
import FilterSection from "./FilterSection";
import ProductCard from "./ProductCard";

const HomeScreen = ({ initialFilters, products, productTypes }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Width Container */}
      <div className="w-full max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Products
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Browse our catalog of {products.data?.length || 0} products
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Showing {products.data?.length || 0} products
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Section - Lebih Compact */}
            <div className="lg:w-64 xl:w-72 flex-shrink-0">
              <FilterSection
                searchParams={initialFilters}
                productTypes={productTypes}
              />
            </div>

            {/* Products Grid - Full Width dengan Optimal Spacing */}
            <div className="flex-1 min-w-0">
              {products.data?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                  {products.data.map((product) => (
                    <div
                      key={product.id}
                      className="w-full h-full transition-transform duration-200 hover:scale-[1.01]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      No products found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or search terms to find what
                      you're looking for.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Loading/Empty State */}
              {products.data?.length === 0 && (
                <div className="mt-8 text-center">
                  <p className="text-gray-500">
                    No products match your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
