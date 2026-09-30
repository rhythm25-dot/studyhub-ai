// A single reusable table used across submissions, quiz attempts, admin
// user lists, etc. Wraps in a horizontally-scrollable container so it
// never breaks the layout on small screens.
export function Table({ columns, data, keyExtractor, emptyMessage = 'No records found' }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col.header}
                className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800/40"
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-3 py-3 ${col.className || ''}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
