import { Suspense } from 'react';
import { UserList } from '@/components/UserList';
import { ApiStatus } from '@/components/ApiStatus';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Frontend</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">API Status</h2>
          <Suspense fallback={<div>Loading API status...</div>}>
            <ApiStatus />
          </Suspense>
        </section>
        
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">User List</h2>
          <Suspense fallback={<div>Loading users...</div>}>
            <UserList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
