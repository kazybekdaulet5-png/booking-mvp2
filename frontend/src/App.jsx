import { ShieldCheck, Store } from 'lucide-react'
import { useState } from 'react'

import AdminView from './components/AdminView.jsx'
import ClientView from './components/ClientView.jsx'

export default function App() {
  const [mode, setMode] = useState('client')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex">
          <button
            onClick={() => setMode('client')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition ${
              mode === 'client'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            <Store size={16} /> Клиент
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition ${
              mode === 'admin'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            <ShieldCheck size={16} /> Админ-панель
          </button>
        </div>
      </div>

      {mode === 'client' ? <ClientView /> : <AdminView />}
    </div>
  )
}
