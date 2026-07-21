import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Modal from '../components/Modal';

type Props = { fileId: string | null; fileName: string; open: boolean; onClose: () => void };
export default function VersionHistoryModal({ fileId, fileName, open, onClose }: Props) {
  const { data = [], isLoading } = useQuery<any[]>({ queryKey: ['file-versions', fileId], enabled: open && !!fileId, queryFn: () => api.get(`/files/${fileId}/versions`).then(r => r.data) });
  const download = async (id: string) => { const r = await api.get(`/files/download/${id}`, { responseType: 'blob' }); const url = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url); };
  return <Modal open={open} title={`Version History: ${fileName}`} onClose={onClose}>{isLoading ? <p>Loading…</p> : <div className="space-y-3">{data.map(v => <div key={v.id} className="flex items-center justify-between border-b pb-2"><div><b>v{v.version_number}</b><p className="text-sm text-ink-dim">{v.upload_by_user?.full_name || '-'} · {new Date(v.upload_date).toLocaleString()} · {(Number(v.file_size) / 1024).toFixed(1)} KB</p><p className="text-sm">{v.remark || '-'}</p></div><button className="text-blue-600" onClick={() => download(v.id)}>Download</button></div>)}</div>}</Modal>;
}
