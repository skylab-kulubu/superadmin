'use client';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  getId?: (row: T) => string;
  idKey?: keyof T | string; // ID için key (getId yerine kullanılabilir)
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  getId,
  idKey = 'id',
}: DataTableProps<T>) {
  const getRowId = (row: T): string => {
    if (getId) {
      return getId(row);
    }
    if (typeof idKey === 'string') {
      return String(idKey.split('.').reduce((obj, key) => obj?.[key], row) ?? '');
    }
    return String(row[idKey] ?? '');
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                Veri bulunamadı
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-gray-50">
                {columns.map((column) => {
                  const value = typeof column.key === 'string' 
                    ? column.key.split('.').reduce((obj, key) => obj?.[key], row)
                    : row[column.key];
                  
                  return (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(value, row) : String(value ?? '')}
                    </td>
                  );
                })}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Düzenle
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

