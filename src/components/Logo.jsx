export default function Logo({ className = '', size = 'default' }) {
  const sizeClasses =
    size === 'large'
      ? 'text-3xl sm:text-4xl'
      : size === 'small'
        ? 'text-xl sm:text-2xl'
        : 'text-2xl sm:text-3xl';

  return (
    <span
      className={`inline-block font-bold tracking-tight ${sizeClasses} ${className}`}
      aria-label="Bhagwati Packers"
    >
      <span className="text-brand-teal">Bhagwati</span>
      <span className="text-brand-orange">Packers</span>
    </span>
  );
}
