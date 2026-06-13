import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/store/authStore';
import { formatDate } from '@/utils/format';
import type { PlatformConfigResponse } from '@/types';

const KEY_LABELS: Record<string, string> = {
  SERVICE_FEE_PERCENT:    'Service Fee (%)',
  TAX_PERCENT:            'Tax Rate (%)',
  PAYOUT_DELAY_DAYS:      'Payout Delay (days)',
  CANCELLATION_POLICY:    'Default Cancellation Policy',
  MAX_GUESTS_PER_BOOKING: 'Max Guests per Booking',
};

export default function PlatformConfigPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editTarget, setEditTarget] = useState<PlatformConfigResponse | null>(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [editValue, setEditValue]   = useState('');
  const [newKey, setNewKey]         = useState('');
  const [newValue, setNewValue]     = useState('');
  const [newDesc, setNewDesc]       = useState('');

  const { data: configs, isLoading } = useQuery({
    queryKey: ['platform-config'],
    queryFn: adminApi.getConfigs,
  });

  const upsertMutation = useMutation({
    mutationFn: adminApi.upsertConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-config'] });
      setEditTarget(null); setAddOpen(false);
      setNewKey(''); setNewValue(''); setNewDesc('');
    },
  });

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="card text-center py-16">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-gray-700 font-medium">Access Restricted</p>
        <p className="text-gray-500 text-sm mt-1">Only Super Admins can modify platform configuration.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">Manage global platform settings. Changes take effect immediately.</p>
        <button onClick={() => setAddOpen(true)} className="btn-primary text-sm">+ Add Config</button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
        ⚠️ Only Super Admins can modify platform configuration. Changes affect all users and properties.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-indigo-600" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Key', 'Label', 'Value', 'Description', 'Last Updated', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {configs?.map(cfg => (
                <tr key={cfg.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-gray-600">{cfg.key}</td>
                  <td className="table-td font-medium">{KEY_LABELS[cfg.key] ?? cfg.key}</td>
                  <td className="table-td">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{cfg.value}</span>
                  </td>
                  <td className="table-td text-gray-500 max-w-[200px] truncate">{cfg.description ?? '—'}</td>
                  <td className="table-td text-gray-500">{formatDate(cfg.updatedAt)}</td>
                  <td className="table-td">
                    <button onClick={() => { setEditTarget(cfg); setEditValue(cfg.value); }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit: ${editTarget ? (KEY_LABELS[editTarget.key] ?? editTarget.key) : ''}`} size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Value</label>
            <input value={editValue} onChange={e => setEditValue(e.target.value)} className="input-base" />
          </div>
          {upsertMutation.error && <p className="text-xs text-red-600">{(upsertMutation.error as Error).message}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditTarget(null)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={() => editTarget && upsertMutation.mutate({ key: editTarget.key, value: editValue, description: editTarget.description })}
              disabled={upsertMutation.isPending || !editValue.trim()}
              className="btn-primary text-sm">
              {upsertMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Configuration" size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Key</label>
            <input value={newKey} onChange={e => setNewKey(e.target.value)} className="input-base" placeholder="e.g. FEATURE_FLAG_X" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Value</label>
            <input value={newValue} onChange={e => setNewValue(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="input-base" placeholder="What does this config control?" />
          </div>
          {upsertMutation.error && <p className="text-xs text-red-600">{(upsertMutation.error as Error).message}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={() => upsertMutation.mutate({ key: newKey, value: newValue, description: newDesc || undefined })}
              disabled={upsertMutation.isPending || !newKey.trim() || !newValue.trim()}
              className="btn-primary text-sm">
              {upsertMutation.isPending ? 'Adding…' : 'Add Config'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
