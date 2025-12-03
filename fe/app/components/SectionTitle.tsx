export default function SectionTitle({ title, subtitle }: any) {
  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
}
