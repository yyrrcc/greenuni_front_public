import '../../assets/css/TimetableTable.css';

// 컴포넌트 예시
const TimetableTable = ({ title = '최종 수강 신청 시간표', year, term, courses = [] }) => {
	const DAYS = ['월', '화', '수', '목', '금'];
	const HEADER_HEIGHT = 68; // 요일 헤더 높이(셀 한 칸 높이랑 동일)
	const BODY_HEIGHT = 80;

	// 9~17시 기준
	const hours = Array.from({ length: 9 }, (_, i) => 9 + i);

	const getBlocksByDay = (day) => courses.filter((c) => c.day === day);

	const getColorClass = (color) => {
		switch (color) {
			case 'yellow':
				return 'tt-block--yellow';
			case 'green':
				return 'tt-block--green';
			case 'blue':
				return 'tt-block--blue';
			case 'orange':
				return 'tt-block--orange';
			case 'red':
				return 'tt-block--red';
			case 'purple':
				return 'tt-block--purple';
			default:
				return 'tt-block--default';
		}
	};

	return (
		<div className="tt-wrapper">
			<div className="tt-header">
				<div>
					<div className="tt-term-text">
						{year}년 {term}
					</div>
					<h2 className="tt-title">{title}</h2>
				</div>
				<div className="tt-header-icons">
					<button className="tt-icon-btn">+</button>
					<button className="tt-icon-btn">⚙</button>
					<button className="tt-icon-btn">≡</button>
				</div>
			</div>

			<div className="tt-table">
				<div className="tt-col tt-col--time">
					<div className="tt-cell tt-cell--head" />
					{hours.map((h) => (
						<div key={h} className="tt-cell tt-cell--time">
							{h}
						</div>
					))}
				</div>

				{DAYS.map((day) => (
					<div key={day} className="tt-col">
						<div className="tt-cell tt-cell--head">{day}</div>

						{hours.map((h) => (
							<div key={h} className="tt-cell tt-cell--slot" />
						))}

						{getBlocksByDay(day).map((course) => {
							const top = HEADER_HEIGHT + (course.start - 9) * BODY_HEIGHT;
							const height = (course.end - course.start) * BODY_HEIGHT;

							return (
								<div
									key={course.id}
									className={`tt-block ${getColorClass(course.color)}`}
									style={{ top: top + 1, height: height - 2 }}
								>
									<div className="tt-block-name">{course.name}</div>
									<div className="tt-block-time">
										{course.start}:00 - {course.end}:00
									</div>
									<div className="tt-block-room">{course.room}</div>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default TimetableTable;
