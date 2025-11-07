'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CompetitionDto } from '@/types/api';
import { competitionsApi } from '@/lib/api/competitions';

export default function CompetitionsPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<CompetitionDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);

  const loadCompetitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await competitionsApi.getAll();
      if (response.success && response.data) {
        setCompetitions(response.data);
      } else {
        setError(response.message || 'Yarışmalar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yarışmalar yüklenirken hata oluştu');
      console.error('Competitions page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  const handleEdit = (competition: CompetitionDto) => {
    router.push(`/competitions/${competition.id}/edit`);
  };

  const handleDelete = (competition: CompetitionDto) => {
    setSelectedCompetitionId(competition.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCompetitionId) {
      try {
        await competitionsApi.delete(selectedCompetitionId);
        loadCompetitions();
        setShowDeleteModal(false);
        setSelectedCompetitionId(null);
      } catch (err) {
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete competition error:', err);
      }
    }
  };

  // Format data for display
  const formattedCompetitions = competitions.map(comp => ({
    ...comp,
    startDateFormatted: comp.startDate ? new Date(comp.startDate).toLocaleDateString('tr-TR') : '',
    endDateFormatted: comp.endDate ? new Date(comp.endDate).toLocaleDateString('tr-TR') : '',
    statusText: comp.active ? 'Aktif' : 'Pasif',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Yarışmalar</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Yarışmalar"
          description="Yarışmaları görüntüleyin ve yönetin"
          actions={(
            <Link href="/competitions/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Yarışma
                </span>
              </Button>
            </Link>
          )}
        />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : competitions.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center">
            <p className="text-dark opacity-60">Henüz yarışma bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedCompetitions}
            columns={[
              { key: 'name', header: 'Ad' },
              { key: 'startDateFormatted', header: 'Başlangıç' },
              { key: 'endDateFormatted', header: 'Bitiş' },
              { key: 'statusText', header: 'Durum' },
            ]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            idKey="id"
          />
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Yarışmayı Sil"
      >
        <p>Bu yarışmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
