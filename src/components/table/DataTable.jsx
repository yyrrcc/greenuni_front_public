// DataTable 테이블 컴포넌트
import '../../assets/css/DataTable.css';

const DataTable = ({ headers, data, onRowClick, onCellClick, clickableHeaders = [], renderActions }) => {
	return (
		<div className="data-table-wrapper">
			<table className="data-table">
				<thead>
					<tr>
						{headers.map((h) => (
							<th key={h} data-col={h}>
								{h}
							</th>
						))}
						{renderActions && <th>관리</th>}
					</tr>
				</thead>
				<tbody>
					{/* 넘겨온 props, data를 map으로 돌려서 (row 라는 이름으로 썼네) 넣어주기 */}
					{data.map((row, rowIdx) => (
						<tr key={rowIdx} onClick={() => onRowClick?.(row)} className={`${onRowClick ? 'rowClick' : ''}`}>
							{headers.map((header) => {
								const isClickable = clickableHeaders.includes(header);

								if (!isClickable) {
									return <td key={header}>{row[header]}</td>;
								}

								return (
									<td key={header}>
										<button
											className="action-btn"
											onClick={(e) => {
												e.stopPropagation(); // 행 클릭 막기
												onCellClick?.({ row, header, rowIdx }); // 필요 정보 외부로 전달
											}}
										>
											{row[header]}
										</button>
									</td>
								);
							})}
							{renderActions && (
								<td
									onClick={(e) => {
										// 행 클릭(onRowClick) 막기
										e.stopPropagation();
									}}
								>
									{renderActions(row, rowIdx)}
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default DataTable;
