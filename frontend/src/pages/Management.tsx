import { useState } from 'react';
import { Building2, Briefcase, Info } from 'lucide-react';
import PortfolioTreeView from '../components/management/PortfolioTreeView';
import AccountDetailPanel from '../components/management/AccountDetailPanel';
import ClientManagement from '../components/management/ClientManagement';
import ClientHoldingsView from '../components/management/ClientHoldingsView';
import PortfolioManagement from '../components/management/PortfolioManagement';
import AccountFormModal from '../components/management/AccountFormModal';
import type { SelectedNode } from '../components/management/PortfolioTreeView';
import { useGetAccountsQuery, useUpdateAccountMutation } from '../services/api';

export default function Management() {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const { data: accounts = [] } = useGetAccountsQuery();
  const [updateAccount] = useUpdateAccountMutation();

  const selectedAccount =
    selectedNode?.type === 'account'
      ? accounts.find((a) => a.id === selectedNode.id)
      : undefined;

  const handleEditAccount = () => {
    if (selectedAccount) {
      setShowAccountModal(true);
    }
  };

  const handleSaveAccount = async (accountData: {
    id?: string;
    name: string;
    accountNumber: string;
    currency: string;
    portfolioId: string;
  }) => {
    if (accountData.id) {
      await updateAccount({
        accountId: accountData.id,
        body: {
          name: accountData.name,
          accountNumber: accountData.accountNumber,
          currency: accountData.currency,
        },
      }).unwrap();
      setShowAccountModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
        <p className="text-gray-600 mt-1">Manage clients, portfolios, accounts, and transactions</p>
      </div>

      {/* Split Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tree View */}
        <div className="w-80 flex-shrink-0">
          <PortfolioTreeView selectedNode={selectedNode} onNodeSelect={setSelectedNode} />
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 overflow-hidden">
          {!selectedNode && (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an item to view details
                </h3>
                <p className="text-gray-600 max-w-md">
                  Choose a client, portfolio, or account from the tree on the left to see its
                  details and manage transactions.
                </p>
              </div>
            </div>
          )}

          {selectedNode?.type === 'client' && (
            <div className="h-full overflow-y-auto bg-white p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {(selectedNode.data as any).name}
                </h2>
              </div>
              <div className="space-y-6">
                <ClientHoldingsView
                  clientName={(selectedNode.data as any).name}
                />
                <ClientManagement />
              </div>
            </div>
          )}

          {selectedNode?.type === 'portfolio' && (
            <div className="h-full overflow-y-auto bg-white p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {(selectedNode.data as any).name}
                </h2>
              </div>
              <PortfolioManagement />
            </div>
          )}

          {selectedNode?.type === 'account' && selectedAccount && (
            <AccountDetailPanel account={selectedAccount} onEdit={handleEditAccount} />
          )}
        </div>
      </div>

      {/* Account Edit Modal */}
      {showAccountModal && selectedAccount && (
        <AccountFormModal
          account={selectedAccount}
          onClose={() => setShowAccountModal(false)}
          onSave={handleSaveAccount}
        />
      )}
    </div>
  );
}
