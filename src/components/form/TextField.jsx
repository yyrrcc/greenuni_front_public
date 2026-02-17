//textArea 컴포넌트
import '../../assets/css/TextField.css';

const TextField = ({ label, name, cols, rows, placeholder, onChange, value }) => {
	return (
		<div className="text-container">
			<label className="text-label">{label}</label>
			<textarea
				className="form-text"
				name={name}
				cols={cols}
				rows={rows}
				placeholder={placeholder}
				onChange={onChange}
				value={value ?? ''}
			/>
		</div>
	);
};

export default TextField;
