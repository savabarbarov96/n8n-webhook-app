import React, { useState } from 'react';
import { Send, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Webhook {
  id: string;
  name: string;
  url: string;
  method: string; // Make method required since we have a default value
}

export function WebhookList({ 
  webhooks,
  onWebhookDeleted,
  onWebhookTriggered 
}: { 
  webhooks: Webhook[];
  onWebhookDeleted: () => void;
  onWebhookTriggered: () => void;
}) {
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [items, setItems] = useState(webhooks);

  React.useEffect(() => {
    setItems(webhooks);
  }, [webhooks]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Webhook deleted successfully');
      onWebhookDeleted();
    } catch (error) {
      toast.error('Failed to delete webhook');
      console.error(error);
    }
  };

  const handleTrigger = async (webhook: Webhook) => {
    try {
      const data = testData[webhook.id] ? JSON.parse(testData[webhook.id]) : {};
      
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: { 'Content-Type': 'application/json' },
        body: webhook.method === 'GET' ? undefined : JSON.stringify(data),
      });

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      await supabase
        .from('webhook_logs')
        .insert([{
          webhook_id: webhook.id,
          request_data: data,
          response_data: responseData,
          status: response.ok ? 'success' : 'error',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      toast.success('Webhook triggered successfully');
      onWebhookTriggered();
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger webhook');
      console.error(error);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setItems(newItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="webhooks">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {items.map((webhook, index) => (
              <Draggable key={webhook.id} draggableId={webhook.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div
                            {...provided.dragHandleProps}
                            className="mr-2 cursor-grab"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{webhook.name}</h3>
                            <p className="text-sm text-gray-500">
                              <span className="inline-block px-2 py-1 mr-2 text-xs font-semibold rounded bg-gray-100">
                                {webhook.method}
                              </span>
                              {webhook.url}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(webhook.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {webhook.method !== 'GET' && (
                        <textarea
                          value={testData[webhook.id] || ''}
                          onChange={(e) => setTestData({ ...testData, [webhook.id]: e.target.value })}
                          placeholder="Enter JSON test data..."
                          className="w-full h-24 p-2 text-sm border rounded-md"
                        />
                      )}
                      <button
                        onClick={() => handleTrigger(webhook)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Trigger Webhook
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}