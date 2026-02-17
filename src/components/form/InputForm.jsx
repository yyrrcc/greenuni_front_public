// input form 컴포넌트
import '../../assets/css/InputForm.css';

const InputForm = ({ label, type = 'text', name, value, onChange, placeholder, onKeyDown }) => {
	return (
		<div className="input-group">
			<label>{label}</label>
			<input
				className="form-input"
				type={type}
				name={name} // 핵심: 이게 있어야 handleChange 하나로 다 처리 가능
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
			/>
		</div>
	);
};
export default InputForm;
