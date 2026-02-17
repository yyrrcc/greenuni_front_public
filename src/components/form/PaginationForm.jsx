import '../../assets/css/Pagination.css';

function PaginationForm({ currentPage, totalPages, blockSize = 10, onPageChange }) {
	// 시작 페이지, 끝 페이지
	const startPage = Math.floor(currentPage / blockSize) * blockSize + 1;
	const endPage = Math.min(startPage + blockSize - 1, totalPages);

	// 이전 버튼, 다음 버튼
	// firstPage, prev, next, lastPage 구현해보기
	const hasPrev = startPage > 0;
	const hasNext = endPage < totalPages;

	// 페이지 번호 배열 (프론트 번호는 1-based, 백은 0-based라서 p-1 사용)
	const pageNumbers = [];
	for (let i = startPage; i <= endPage; i++) {
		pageNumbers.push(i - 1);
	}
	// 페이지 번호 배열 - 깔끔한 버전 (참고)
	// const pageNumbers = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);

	// 페이지 이동 함수
	const goPage = (page) => {
		if (page >= 0 && page < totalPages) {
			onPageChange(page);
		}
	};

	return (
		<div className="pagination">
			<div className="pagination__inner">
				<button
					className="pagination-btn pagination-btn--nav"
					disabled={currentPage === 0}
					onClick={() => goPage(currentPage - 1)}
				>
					◀
				</button>

				<div className="pagination-numbers">
					{pageNumbers.map((p) => (
						<button
							key={p}
							className={`pagination-btn pagination-btn--num ${p === currentPage ? 'is-active' : ''}`}
							onClick={() => goPage(p)}
						>
							{p + 1}
						</button>
					))}
				</div>

				<button
					className="pagination-btn pagination-btn--nav"
					disabled={currentPage === totalPages - 1}
					onClick={() => goPage(currentPage + 1)}
				>
					▶
				</button>
			</div>
		</div>
	);
}

export default PaginationForm;
