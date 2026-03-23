'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaPlus, FaTrash, FaSave, FaBook, FaClock, FaUsers, FaCheck, FaTimes, FaEdit, FaEye } from 'react-icons/fa'

export default function TeacherAssignmentsPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [gradingScores, setGradingScores] = useState({})
  const [gradingSubmitting, setGradingSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    topic: '',
    class: '',
    subject: '',
    deadline: '',
    questions: [{ question: '' }]
  })

  const filteredSubjects = formData.class 
    ? subjects.filter(s => !s.classes || s.classes.length === 0 || s.classes.some(c => (c._id?.toString() || c.toString()) === formData.class))
    : subjects

  useEffect(() => {
    if (session?.user?.email) {
      fetchTeacherData()
    }
  }, [session])

  const fetchTeacherData = async () => {
    try {
      const [classesRes, subjectsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/teacher/classes?email=${session.user.email}`),
        fetch(`/api/teacher/subjects?email=${session.user.email}`),
        fetch(`/api/assignment?teacher=${session.user.email}`)
      ])

      const classesData = await classesRes.json()
      const subjectsData = await subjectsRes.json()
      const assignmentsData = await assignmentsRes.json()

      if (classesData.success) setClasses(classesData.classes || [])
      if (subjectsData.success) setSubjects(subjectsData.subjects || [])
      if (assignmentsData.success) setAssignments(assignmentsData.assignments || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`/api/assignment/grade?id=${assignmentId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedAssignment(data.assignment)
        setSubmissions(data.assignment.submissions || [])
        const scores = {}
        data.assignment.submissions?.forEach(sub => {
          const studentId = sub.student?._id?.toString() || sub.student?.toString() || sub.student
          scores[studentId] = sub.score || 0
        })
        setGradingScores(scores)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    }
  }

  const handleGradeSubmit = async (studentId) => {
    const id = studentId?.toString()
    setGradingSubmitting(true)
    try {
      const response = await fetch('/api/assignment/grade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          studentId: id,
          score: gradingScores[id]
        })
      })
      const data = await response.json()
      if (data.success) {
        await fetchSubmissions(selectedAssignment._id)
        setSelectedAssignment(null)
        setSubmissions([])
      }
    } catch (error) {
      console.error('Error grading:', error)
    } finally {
      setGradingSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index][field] = value
    setFormData(prev => ({ ...prev, questions: updatedQuestions }))
  }

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '' }]
    }))
  }

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, questions: updatedQuestions }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacherEmail: session.user.email
        })
      })

      const data = await response.json()

      if (data.success) {
        setAssignments(prev => [data.assignment, ...prev])
        setShowForm(false)
setFormData({
          topic: '',
          subject: '',
          class: '',
          deadline: '',
          questions: [{ question: '' }]
        })
      } else {
        alert(data.message || 'Error creating assignment')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 text-sm md:text-base">Create and manage assignments for your classes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base"
          >
            <FaPlus /> <span className="hidden sm:inline">Create Assignment</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">New Assignment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Topic covered"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, class: e.target.value, subject: '' }))
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.class}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{formData.class ? 'Select subject' : 'Select class first'}</option>
                    {filteredSubjects.map(subject => (
                      <option key={subject._id} value={subject._id}>{subject.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <FaPlus /> Add Question
                  </button>
                </div>

                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Question {qIndex + 1}</span>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your theoretical/essay question"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaSave />
                  )}
                  {submitting ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Your Assignments</h2>
          </div>
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaBook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No assignments yet. Create your first assignment!</p>
            </div>
          ) : (
            <div className="divide-y">
              {assignments.map(assignment => (
                <div key={assignment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{assignment.subject?.Name}</h3>
                      <p className="text-sm text-gray-600">Topic: {assignment.topic}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaUsers className="w-3 h-3" /> {assignment.class?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="w-3 h-3" /> {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        assignment.isPublished 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {assignment.isPublished ? <FaCheck /> : <FaTimes />}
                        {assignment.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <p className="text-sm text-gray-500">
                        {assignment.submissions?.length || 0} submissions
                      </p>
                      <button
                        onClick={() => fetchSubmissions(assignment._id)}
                        className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                      >
                        <FaEye /> View & Grade
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">{selectedAssignment.subject?.Name}</h2>
                  <p className="text-sm text-gray-600">Topic: {selectedAssignment.topic}</p>
                </div>
                <button
                  onClick={() => { setSelectedAssignment(null); setSubmissions([]) }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {submissions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {submissions.map((submission, index) => {
                      const studentId = submission.student?._id?.toString() || submission.student?.toString() || submission.student
                      return (
                        <div key={index} className="border rounded-lg p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {submission.student?.Name || 'Unknown Student'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Email: {submission.student?.email || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-gray-600">Score:</span>
                              <input
                                type="number"
                                value={gradingScores[studentId] || 0}
                                onChange={(e) => setGradingScores(prev => ({
                                  ...prev,
                                  [studentId]: parseInt(e.target.value)
                                }))}
                                min={0}
                                max={selectedAssignment.totalPoints}
                                className="w-16 md:w-20 px-2 py-1 border rounded-lg text-sm"
                              />
                              <span className="text-gray-500 text-sm">/ {selectedAssignment.totalPoints}</span>
                              <button
                                onClick={() => handleGradeSubmit(studentId)}
                                disabled={gradingSubmitting}
                                className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
