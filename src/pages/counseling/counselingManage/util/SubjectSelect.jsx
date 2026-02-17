// 과목 선택 공통 컴포넌트
import OptionForm from '../../../../components/form/OptionForm';

// subjects: [{ id, name }]
export default function SubjectSelect({ label = '과목', subjects = [], value, onChange, includeAll = true }) {
	const options = [];

	if (includeAll) {
		options.push({ value: '', label: '과목 선택' });
	}

	subjects.forEach((s) => {
		options.push({
			value: s?.id ?? s.subjectName,
			label: s.name,
		});
	});

	return <OptionForm label={label} name="subjectId" value={value} onChange={onChange} options={options} />;
}
