'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Input, Spinner, EmptyState, Badge } from '@/components/ui'
import { Search, Plus, Trash2, Power, PowerOff } from 'lucide-react'

interface SearchItem { id: string; name: string; keywords: string; location: string | null; remote: boolean; isActive: boolean; createdAt: string; _count: { jobs: number } }

export default function SearchesPage() {
  const [searches, setSearches] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [remote, setRemote] = useState(false)

  const fetchSearches = async () => {
    setLoading(true)
    const response = await fetch('/api/searches')
    const data = await response.json()
    setSearches(data.searches)
    setLoading(false)
  }

  const createSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !keywords.trim()) return
    setCreating(true)
    await fetch('/api/searches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), keywords: keywords.trim(), location: location.trim() || undefined, remote }) })
    setName(''); setKeywords(''); setLocation(''); setRemote(false); setShowCreateForm(false)
    fetchSearches()
    setCreating(false)
  }

  const toggleSearch = async (id: string, isActive: boolean) => {
    await fetch(`/api/searches/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) })
    fetchSearches()
  }

  const deleteSearch = async (id: string) => {
    if (!confirm('Delete this search?')) return
    await fetch(`/api/searches/${id}`, { method: 'DELETE' })
    fetchSearches()
  }

  useEffect(() => { fetchSearches() }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg"><Search className="w-5 h-5 text-white" /></div>Saved Searches</h1>
          <p className="page-subtitle">Create saved searches to automatically find jobs</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} icon={<Plus className="w-4 h-4" />}>New Search</Button>
      </div>

      {showCreateForm && (
        <Card className="animate-slide-down">
          <form onSubmit={createSearch} className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Search</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Search Name" placeholder="e.g., Senior Frontend Roles" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Keywords" placeholder="e.g., react, typescript" value={keywords} onChange={(e) => setKeywords(e.target.value)} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Location" placeholder="e.g., San Francisco, CA" value={location} onChange={(e) => setLocation(e.target.value)} />
              <div className="flex items-end pb-3"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} className="w-5 h-5 rounded" /><span>Remote only</span></label></div>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button><Button type="submit" loading={creating}>Create</Button></div>
          </form>
        </Card>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        : searches.length === 0 ? <Card><EmptyState icon={<Search className="w-12 h-12" />} title="No saved searches" description="Create your first search" action={<Button onClick={() => setShowCreateForm(true)} icon={<Plus className="w-4 h-4" />}>Create Search</Button>} /></Card>
        : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{searches.map((search, i) => (
          <Card key={search.id} hover className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-semibold truncate">{search.name}</h3><Badge variant={search.isActive ? 'success' : 'neutral'} size="sm">{search.isActive ? 'Active' : 'Paused'}</Badge></div><p className="text-sm text-surface-500 mt-1 truncate">{search.keywords}</p></div>
              <div className="text-right"><div className="text-2xl font-bold text-brand-600">{search._count.jobs}</div><div className="text-xs text-surface-400">jobs</div></div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-100">{search.location && <Badge variant="neutral" size="sm">{search.location}</Badge>}{search.remote && <Badge variant="info" size="sm">Remote</Badge>}</div>
            <div className="flex items-center justify-between mt-4">
              <Button size="sm" variant="ghost" onClick={() => toggleSearch(search.id, search.isActive)} icon={search.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}>{search.isActive ? 'Pause' : 'Activate'}</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteSearch(search.id)} icon={<Trash2 className="w-4 h-4" />} className="text-red-600 hover:bg-red-50">Delete</Button>
            </div>
          </Card>
        ))}</div>
      }
    </div>
  )
}
