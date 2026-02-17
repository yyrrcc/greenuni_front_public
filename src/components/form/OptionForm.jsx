import '../../assets/css/OptionForm.css';

const OptionForm = ({ label, name, value, onChange, options = [], placeholder, className = 'input--box' }) => {
	return (
		<div className="option-group">
			{label && <label className="option-label">{label}</label>}

			<select name={name} className={className} value={value} onChange={onChange}>
				{placeholder && (
					<option value="" disabled>
						{placeholder}
					</option>
				)}

				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default OptionForm;
