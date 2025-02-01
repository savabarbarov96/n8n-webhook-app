import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function WebhookForm({ onWebhookAdded }: { onWebhookAdded: () => void }) {
  const [name, setName] = useState(() => 
    uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], style: 'capital' })
  );
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('webhooks')
        .insert([{ 
          name, 
          url, 
          method,
          user_id: (await supabase.auth.getUser()).data.user?.id 
        }]);

      if (error) throw error;

      toast.success('Webhook added successfully');
      setName(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], style: 'capital' }));
      setUrl('');
      setMethod('POST');
      onWebhookAdded();
    } catch (error) {
      toast.error('Failed to add webhook');
      console.error(error);
    }
  };

  const generateNewName = () => {
    setName(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], style: 'capital' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Webhook Name
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={generateNewName}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
            >
              Generate
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700">
            Method
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          Webhook URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Webhook
      </button>
    </form>
  );
}