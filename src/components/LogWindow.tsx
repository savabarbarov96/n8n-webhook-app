import React from 'react';

interface Log {
  id: string;
  webhook_id: string;
  request_data: any;
  response_data: any;
  status: string;
  created_at: string;
}

export function LogWindow({ logs }: { logs: Log[] }) {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-md h-96 overflow-y-auto font-mono">
      <h2 className="text-xl font-semibold mb-4">Webhook Logs</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className={`p-3 rounded ${
            log.status === 'success' ? 'bg-green-900/30' : 'bg-red-900/30'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-400">
                {new Date(log.created_at).toLocaleString()}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                log.status === 'success' ? 'bg-green-700' : 'bg-red-700'
              }`}>
                {log.status}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-400">Request:</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(log.request_data, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400">Response:</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(log.response_data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}