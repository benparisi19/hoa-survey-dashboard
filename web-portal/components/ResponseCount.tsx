'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function ResponseCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { count, error } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching response count:', error);
        } else {
          setCount(count);
        }
      } catch (error) {
        console.error('Error in ResponseCount component:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (count === null) {
    return <span className="text-sm text-gray-500">Response count unavailable</span>;
  }

  return (
    <div className="text-sm text-gray-500">
      {count} Survey Response{count !== 1 ? 's' : ''}
    </div>
  );
}