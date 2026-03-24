'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AcademicSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showTermForm, setShowTermForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionForm, setSessionForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });
  const [termForm, setTermForm] = useState({
    name: '',
    termNumber: 1,
    startDate: '',
    endDate: '',
    isActive: false,
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/fees/academic');
      const data = await res.json();
      setSessions(data || []);
      if (data?.length > 0) {
        setSelectedSession(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerms = async (sessionId) => {
    try {
      const res = await fetch(`/api/fees/academic?type=terms&id=${sessionId}`);
      const data = await res.json();
      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sessionForm, documentType: 'session' }),
      });
      if (res.ok) {
        alert('Academic session created successfully');
        setShowSessionForm(false);
        setSessionForm({ name: '', startDate: '', endDate: '', isActive: false });
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleTermSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...termForm, academicSession: selectedSession, documentType: 'term' }),
      });
      if (res.ok) {
        alert('Term created successfully');
        setShowTermForm(false);
        setTermForm({ name: '', termNumber: 1, startDate: '', endDate: '', isActive: false });
        fetchTerms(selectedSession);
      }
    } catch (error) {
      console.error('Error creating term:', error);
    }
  };

  if (loading) return <div className="p-3 sm:p-6">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold">Academic Session & Term Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg">Academic Sessions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage academic years/sessions</CardDescription>
              </div>
              <Button onClick={() => setShowSessionForm(!showSessionForm)} size="sm" className="w-full sm:w-auto">
                {showSessionForm ? 'Cancel' : '+ Add'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showSessionForm && (
              <form onSubmit={handleSessionSubmit} className="space-y-3 sm:space-y-4 mb-4 p-3 sm:p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Session Name</label>
                  <Input
                    value={sessionForm.name}
                    onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                    placeholder="e.g., 2025-2026"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={sessionForm.startDate}
                      onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                      value={sessionForm.endDate}
                      onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sessionActive"
                    checked={sessionForm.isActive}
                    onChange={(e) => setSessionForm({ ...sessionForm, isActive: e.target.checked })}
                  />
                  <label htmlFor="sessionActive" className="text-sm">Set as Active</label>
                </div>
                <Button type="submit" className="w-full">Create Session</Button>
              </form>
            )}
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session._id} className="p-2 sm:p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{session.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {session.startDate ? new Date(session.startDate).toLocaleDateString() : ''} - 
                      {session.endDate ? new Date(session.endDate).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {session.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  )}
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No sessions found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg">Terms</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage terms for selected session</CardDescription>
              </div>
              <Button onClick={() => setShowTermForm(!showTermForm)} size="sm" disabled={!selectedSession} className="w-full sm:w-auto">
                {showTermForm ? 'Cancel' : '+ Add'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sessions.length > 0 ? (
              <>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-sm font-medium mb-1">Select Session</label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    {sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>

                {showTermForm && (
                  <form onSubmit={handleTermSubmit} className="space-y-3 sm:space-y-4 mb-4 p-3 sm:p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1">Term Name</label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={termForm.name}
                        onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                        required
                      >
                        <option value="">Select term</option>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Term Number</label>
                      <Input
                        type="number"
                        min="1"
                        max="4"
                        value={termForm.termNumber}
                        onChange={(e) => setTermForm({ ...termForm, termNumber: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Input
                          type="date"
                          value={termForm.startDate}
                          onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <Input
                          type="date"
                          value={termForm.endDate}
                          onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="termActive"
                        checked={termForm.isActive}
                        onChange={(e) => setTermForm({ ...termForm, isActive: e.target.checked })}
                      />
                      <label htmlFor="termActive" className="text-sm">Set as Active</label>
                    </div>
                    <Button type="submit" className="w-full">Create Term</Button>
                  </form>
                )}

                <div className="space-y-2">
                  {terms.map((term) => (
                    <div key={term._id} className="p-2 sm:p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{term.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Term {term.termNumber}
                        </p>
                      </div>
                      {term.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                      )}
                    </div>
                  ))}
                  {terms.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No terms found for this session</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm sm:text-base">Create a session first to add terms</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
