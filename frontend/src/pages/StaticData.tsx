import { useState } from 'react';
import { Database, TrendingUp } from 'lucide-react';
import SecuritiesManagement from '../components/staticdata/SecuritiesManagement';
import BenchmarksManagement from '../components/staticdata/BenchmarksManagement';

type TabType = 'securities' | 'benchmarks';

export default function StaticData() {
  const [activeTab, setActiveTab] = useState<TabType>('securities');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Static Data Management</h1>
            <p className="text-gray-600 mt-1">Manage securities, benchmarks, and reference data</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-6">
        <nav className="-mb-px flex space-x-6">
          <TabButton
            active={activeTab === 'securities'}
            onClick={() => setActiveTab('securities')}
            icon={<Database className="w-4 h-4" />}
            label="Securities"
          />
          <TabButton
            active={activeTab === 'benchmarks'}
            onClick={() => setActiveTab('benchmarks')}
            icon={<TrendingUp className="w-4 h-4" />}
            label="Benchmarks"
          />
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'securities' && <SecuritiesManagement />}
        {activeTab === 'benchmarks' && <BenchmarksManagement />}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
