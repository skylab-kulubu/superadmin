'use client';

import Link from 'next/link';
import { DataTable } from '@/components/tables/DataTable';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users';

type UserRow = Record<string, any> & { id: string };

export function UsersTableClient({ data }: { data: UserRow[] }) {
  const router = useRouter();

  const handleDelete = async (row: UserRow) => {
    if (!row?.id) return;
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await usersApi.delete(row.id);
      router.refresh();
    } catch (err) {
      alert('Kullanıcı silinirken hata oluştu');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };
  return (
    <DataTable
      data={data}
      columns={[
        { key: 'firstName', header: 'Ad' },
        { key: 'lastName', header: 'Soyad' },
        { key: 'email', header: 'Email' },
        { key: 'username', header: 'Kullanıcı Adı' },
        { key: 'rolesString', header: 'Roller' },
        {
          key: 'actions',
          header: 'İşlemler',
          render: (_value, row) => (
            <div className="flex items-center gap-3">
              <Link href={`/users/${row.id}`} className="text-pembe hover:text-yesil underline cursor-pointer">
                Düzenle
              </Link>
              <button onClick={() => handleDelete(row)} className="text-pembe-600 hover:text-pembe-700 underline cursor-pointer">
                Sil
              </button>
            </div>
          ),
        },
      ]}
      idKey="id"
    />
  );
}


