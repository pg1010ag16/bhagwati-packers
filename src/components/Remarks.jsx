export default function Remarks({ value, onChange, disabled }) {
  return (
    <section className="card" aria-labelledby="remarks-heading">
      <h2 id="remarks-heading" className="section-title mb-4">
        Custom Remarks
      </h2>
      <label htmlFor="custom-remarks" className="field-label">
        Remarks (included in generated image)
      </label>
      <textarea
        id="custom-remarks"
        className="input-base min-h-[120px] resize-y"
        placeholder="Enter any additional remarks for the manufacturing sheet…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
      />
    </section>
  );
}
