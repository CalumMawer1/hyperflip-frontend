import React from 'react';
import { PaginationInfo } from './types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({pagination, onPageChange, itemsPerPage, onItemsPerPageChange }) => {
  const { total_pages, page } = pagination;
  let pageNumbers: number[] = [];
  const maxPagesToShow = 5;

  const showFirstPageButton = page > 2;
  const showLastPageButton = page < total_pages - 1;

  if (total_pages <= maxPagesToShow) {
    pageNumbers = Array.from({ length: total_pages }, (_, i) => i + 1);
  } else {
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    if (page <= halfMaxPages) {
      pageNumbers = Array.from({ length: maxPagesToShow }, (_, i) => i + 1);
    } else if (page > total_pages - halfMaxPages) {
      pageNumbers = Array.from({ length: maxPagesToShow }, (_, i) => total_pages - maxPagesToShow + i + 1);
    } else {
      pageNumbers = Array.from({ length: maxPagesToShow }, (_, i) => page - halfMaxPages + i);
    }
  }

  return (
    <div className="flex justify-center mt-6 flex-wrap items-center gap-2">
      {/* First page button */}
      {showFirstPageButton && (
        <button
          onClick={() => onPageChange(1)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-[#04e6e0]/30 text-[#04e6e0] hover:bg-[#04e6e0]/10 transition-colors"
          aria-label="Go to first page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Previous button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`flex items-center justify-center w-9 h-9 rounded-md border ${
          page === 1 
            ? 'border-gray-700 text-gray-600 cursor-not-allowed' 
            : 'border-[#04e6e0]/30 text-[#04e6e0] hover:bg-[#04e6e0]/10'
        } transition-colors`}
        aria-label="Go to previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Page numbers */}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
            number === page
              ? 'bg-[#04e6e0] text-black font-semibold'
              : 'bg-black/40 border border-[#04e6e0]/30 text-[#04e6e0] hover:bg-[#04e6e0]/10'
          }`}
          aria-label={`Go to page ${number}`}
          aria-current={number === page ? 'page' : undefined}
        >
          {number}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === total_pages}
        className={`flex items-center justify-center w-9 h-9 rounded-md border ${
          page === total_pages
            ? 'border-gray-700 text-gray-600 cursor-not-allowed' 
            : 'border-[#04e6e0]/30 text-[#04e6e0] hover:bg-[#04e6e0]/10'
        } transition-colors`}
        aria-label="Go to next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Last page button */}
      {showLastPageButton && (
        <button
          onClick={() => onPageChange(total_pages)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-[#04e6e0]/30 text-[#04e6e0] hover:bg-[#04e6e0]/10 transition-colors"
          aria-label="Go to last page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Items per page selector */}
      <select
        className="ml-2 bg-black/40 text-[#04e6e0] border border-[#04e6e0]/30 rounded-md px-2 py-1.5 text-sm"
        value={itemsPerPage}
        onChange={(e) => {
          onItemsPerPageChange(Number(e.target.value));
        }}
        aria-label="Select number of items per page"
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
        <option value={100}>100 per page</option>
      </select>
    </div>
  );
};

export default Pagination; 