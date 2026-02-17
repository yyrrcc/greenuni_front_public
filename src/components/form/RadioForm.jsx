import '../../assets/css/RadioForm.css';

const RadioForm = ({ label, name, value, onChange, options = [] }) => {
	return (
		<div className="option-group">
			{label && <label className="option-label">{label}</label>}

			<div className="radio-list">
				{options.map((opt) => (
					<label key={opt.value} className="radio-item">
						<input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} />
						{opt.label}
					</label>
				))}
			</div>
		</div>
	);
};

export default RadioForm;
