'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FeeStructureManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classFees, setClassFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [selectedFeeForAssign, setSelectedFeeForAssign] = useState(null);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [formData, setFormData] = useState({
    name: 'Tuition Fee',
    description: '',
    academicSession: '',
    term: '',
    feeType: 'tuition',
    amount: '',
    dueDate: '',
    isOptional: false,
    penaltyAmount: '',
    penaltyStartDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassFees();
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (formData.academicSession) {
      fetchTerms(formData.academicSession);
    }
  }, [formData.academicSession]);

  const fetchData = async () => {
    try {
      const [sessionsRes, classesRes] = await Promise.all([
        fetch('/api/fees/academic?type=sessions'),
        fetch('/api/classes'),
      ]);
      const sessionsData = await sessionsRes.json();
      const classesData = await classesRes.json();
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerms = async (sessionId) => {
    try {
      const res = await fetch(`/api/fees/academic?type=terms&id=${sessionId}`);
      const data = await res.json();
      setTerms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const fetchClassFees = async () => {
    try {
      const params = new URLSearchParams({ classId: selectedClass });
      const res = await fetch(`/api/fees/structure?${params}`);
      const data = await res.json();
      setClassFees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching class fees:', error);
      setClassFees([]);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    try {
      const params = new URLSearchParams({ all: 'true', classId: selectedClass });
      const res = await fetch(`/api/student?${params.toString()}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const handleSessionChange = async (sessionId) => {
    setFormData({ ...formData, academicSession: sessionId, term: '' });
    await fetchTerms(sessionId);
  };

  const handleFeeTypeChange = (feeType) => {
    // Auto-populate the fee name based on fee type, but preserve if user has customized it
    const feeTypeLabels = {
      tuition: 'Tuition Fee',
      registration: 'Registration Fee',
      exam: 'Examination Fee',
      transport: 'Transportation Fee',
      hostel: 'Hostel Fee',
      library: 'Library Fee',
      sports: 'Sports Fee',
      uniform: 'Uniform Fee',
      other: 'Other Fee'
    };
    
    // Only auto-fill name if it's empty or matches a previous auto-fill value
    const autoFillName = feeTypeLabels[feeType] || '';
    const currentName = formData.name;
    const isAutoFilled = Object.values(feeTypeLabels).includes(currentName);
    
    setFormData({ 
      ...formData, 
      feeType,
      name: (currentName === '' || isAutoFilled) ? autoFillName : currentName
    });
  };

  const resetForm = () => {
    setFormData({
      name: 'Tuition Fee',
      description: '',
      academicSession: '',
      term: '',
      feeType: 'tuition',
      amount: '',
      dueDate: '',
      isOptional: false,
      penaltyAmount: '',
      penaltyStartDate: '',
    });
    setEditingFee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        classLevel: selectedClass,
      };

      let url = '/api/fees/structure';
      let method = 'POST';

      if (editingFee) {
        url = `/api/fees/structure?id=${editingFee._id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingFee ? 'Fee structure updated successfully' : 'Fee structure created successfully');
        setShowForm(false);
        resetForm();
        fetchClassFees();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save fee structure');
      }
    } catch (error) {
      console.error('Error saving fee structure:', error);
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name || '',
      description: fee.description || '',
      academicSession: fee.academicSession?._id || '',
      term: fee.term?._id || '',
      feeType: fee.feeType || 'tuition',
      amount: fee.amount?.toString() || '',
      dueDate: fee.dueDate ? fee.dueDate.split('T')[0] : '',
      isOptional: fee.isOptional || false,
      penaltyAmount: fee.penaltyAmount?.toString() || '',
      penaltyStartDate: fee.penaltyStartDate ? fee.penaltyStartDate.split('T')[0] : '',
    });
    setShowForm(true);
    fetchTerms(fee.academicSession?._id);
  };

  const handleDelete = async (fee) => {
    if (!confirm(`Are you sure you want to delete "${fee.name}"? This will not delete fees already assigned to students.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/fees/structure?id=${fee._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Fee structure deleted successfully');
        fetchClassFees();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete fee structure');
      }
    } catch (error) {
      console.error('Error deleting fee structure:', error);
    }
  };

  const openAssignModal = (fee) => {
    setSelectedFeeForAssign(fee);
    setAssignToAll(true);
    setSelectedStudents([]);
    setShowAssignModal(true);
  };

  const handleAssignFee = async () => {
    try {
      const payload = {
        feeStructureId: selectedFeeForAssign._id,
        studentIds: assignToAll ? [] : selectedStudents,
      };
      const res = await fetch(`/api/fees/structure?action=assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(`Assigned to ${data.assigned} students, updated ${data.updated || 0}, skipped ${data.skipped}`);
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning fee:', error);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  if (loading) return <div className="p-3 sm:p-6">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Fee Structure Management</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">Select Class</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-1 lg:col-span-2 flex items-end">
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }} disabled={!selectedClass} className="w-full sm:w-auto">
            {showForm ? 'Cancel' : '+ Add New Fee'}
          </Button>
        </div>
      </div>

      {selectedClass && showForm && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">{editingFee ? 'Edit Fee' : `Add New Fee for ${classes.find(c => c._id === selectedClass)?.name}`}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{editingFee ? 'Update the fee structure' : 'Create a new fee structure for this class'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fee Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tuition Fee"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fee Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.feeType}
                    onChange={(e) => handleFeeTypeChange(e.target.value)}
                  >
                    <option value="tuition">Tuition</option>
                    <option value="registration">Registration</option>
                    <option value="exam">Exam</option>
                    <option value="transport">Transport</option>
                    <option value="hostel">Hostel</option>
                    <option value="library">Library</option>
                    <option value="sports">Sports</option>
                    <option value="uniform">Uniform</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Session</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.academicSession}
                    onChange={(e) => handleSessionChange(e.target.value)}
                    required
                  >
                    <option value="">Select session</option>
                    {sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Term</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    disabled={!formData.academicSession}
                    required
                  >
                    <option value="">Select term</option>
                    {terms.map((term) => (
                      <option key={term._id} value={term._id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">{editingFee ? 'Update Fee' : 'Create Fee'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedClass && classFees.length > 0 && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Fees for {classes.find(c => c._id === selectedClass)?.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage fees assigned to this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Fee Name</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Type</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">Session/Term</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Amount</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classFees.map((fee) => (
                    <tr key={fee._id} className="border-b">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">{fee.name}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 capitalize text-xs sm:text-sm">{fee.feeType}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">
                        {fee.academicSession?.name} - {fee.term?.name}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-xs sm:text-sm">₦{fee.amount?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(fee)} className="text-xs sm:text-sm px-1 sm:px-2">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openAssignModal(fee)} className="text-xs sm:text-sm px-1 sm:px-2">
                            Assign
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(fee)} className="text-xs sm:text-sm px-1 sm:px-2">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && classFees.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          No fees found for this class. Click "Add New Fee" to create one.
        </div>
      )}

      {showAssignModal && selectedFeeForAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Assign "{selectedFeeForAssign.name}" to Students</h2>
            
            <div className="mb-3 sm:mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignToAll}
                  onChange={(e) => setAssignToAll(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm sm:text-base">Assign to all students in class ({students.length} students)</span>
              </label>
            </div>

            {!assignToAll && (
              <div className="mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <label className="font-medium text-sm sm:text-base">Select Specific Students</label>
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="border rounded-lg max-h-32 sm:max-h-48 overflow-auto">
                  {students.map((student) => (
                    <label
                      key={student._id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm sm:text-base">{student.Name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedStudents.length} student(s) selected
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={handleAssignFee}
                disabled={!assignToAll && selectedStudents.length === 0}
                className="w-full sm:w-auto"
              >
                Assign Fee
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
