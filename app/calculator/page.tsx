import CalculatorForm from '@/components/CalculatorForm';

export default function CalculatorPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-gray-900">薪资计算器</h1>
      <p className="mt-1 text-sm text-gray-500">
        算算你的时薪，对比当地最低工资参考线
      </p>

      <div className="mt-4">
        <CalculatorForm />
      </div>
    </div>
  );
}
