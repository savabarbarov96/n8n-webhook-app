import React, { useEffect, useState } from 'react';
import { Webhook } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { WebhookForm } from './components/WebhookForm';
import { WebhookList } from './components/WebhookList';
import { LogWindow } from './components/LogWindow';
import { Auth } from './components/Auth';

function App() {
  const [session, setSession] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchWebhooks = async () => {
    const { data } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });
    setWebhooks(data || []);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs(data || []);
  };

  useEffect(() => {
    if (session) {
      fetchWebhooks();
      fetchLogs();
    }
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <Toaster position="top-right" />
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Webhook className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Webhook Manager</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <WebhookForm onWebhookAdded={() => {
              fetchWebhooks();
              fetchLogs();
            }} />
            
            <WebhookList 
              webhooks={webhooks}
              onWebhookDeleted={fetchWebhooks}
              onWebhookTriggered={fetchLogs}
            />
          </div>

          <div>
            <LogWindow logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;