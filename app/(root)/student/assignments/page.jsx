'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaBook, FaClock, FaCheck, FaTimes, FaPlay, FaSave } from 'react-icons/fa'

export default function StudentAssignmentsPage() {
  const { data: session } = useSession()
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  useEffect(() => {
    if (session?.user?.email) {
      fetchStudentData()
    }
  }, [session])

  const fetchStudentData = async () => {
    try {
      const [studentRes, assignmentsRes] = await Promise.all([
        fetch(`/api/student?email=${session.user.email}`),
        fetch(`/api/assignment?student=${session.user.email}`)
      ])

      const studentData = await studentRes.json()
      const assignmentsData = await assignmentsRes.json()

      if (studentData.success) {
        setStudent(studentData.student)
      }

      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSubmissionStatus = (assignment) => {
    const studentId = student?._id?.toString()
    const submission = assignment.submissions?.find(
      s => s.student?._id?.toString() === studentId || s.student?.toString() === studentId || s.student === studentId
    )
    return submission
  }

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = async () => {
    if (!selectedAssignment || !student) return

    setSubmitting(true)
    try {
      const answerArray = Object.entries(answers).map(([index, answer]) => ({
        questionIndex: parseInt(index),
        answer
      }))

      const response = await fetch('/api/assignment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          studentId: student._id,
          answers: answerArray
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmittedData(data)
        await fetchStudentData()
      } else {
        alert(data.message || 'Error submitting assignment')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDeadline = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const isPast = now > deadlineDate

    return {
      date: deadlineDate.toLocaleDateString() + ' ' + deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPast
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
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 text-sm md:text-base">Complete your assignments before the deadline</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-3 md:p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Available Assignments</h2>
              </div>
              {assignments.length === 0 ? (
                <div className="p-6 md:p-8 text-center text-gray-500">
                  <FaBook className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
                  <p>No assignments available</p>
                </div>
              ) : (
                <div className="divide-y max-h-[400px] md:max-h-[600px] overflow-y-auto">
                  {assignments.map(assignment => {
                    const submission = getSubmissionStatus(assignment)
                    const { isPast } = formatDeadline(assignment.deadline)

                    return (
                      <button
                        key={assignment._id}
                        onClick={() => {
                          setSelectedAssignment(assignment)
                          setAnswers({})
                          setSubmittedData(null)
                        }}
                        className={`w-full p-3 md:p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedAssignment?._id === assignment._id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 text-sm md:text-base">{assignment.subject?.Name}</h3>
                        <p className="text-sm text-gray-600">Topic: {assignment.topic}</p>
                        <p className="text-xs text-gray-500 mt-1">Teacher: {assignment.teacher?.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2">
                          <span className={`flex items-center gap-1 text-xs ${
                            isPast ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            <FaClock className="w-3 h-3" /> <span className="hidden sm:inline">{formatDeadline(assignment.deadline).date}</span>
                          </span>
                          {submission ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <FaCheck /> Score: {submission.score}/{submission.totalPoints}
                            </span>
                          ) : isPast ? (
                            <span className="flex items-center gap-1 text-xs text-red-500">
                              <FaTimes /> Expired
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <FaPlay /> Start
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAssignment ? (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                {(() => {
                  const submission = getSubmissionStatus(selectedAssignment)
                  const { isPast } = formatDeadline(selectedAssignment.deadline)
                  const hasSubmitted = submission && submission.submittedAt

                  if (hasSubmitted || submittedData) {
                    const scoreData = submittedData || submission
                    return (
                      <div className="text-center py-6 md:py-8">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          scoreData.isLate ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {scoreData.isLate ? (
                            <FaTimes className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                          ) : (
                            <FaCheck className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                          )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          {scoreData.isLate ? 'Submitted Late' : 'Submitted Successfully!'}
                        </h2>
                        {scoreData.score !== null ? (
                          <p className="text-base md:text-lg text-gray-600">
                            Your Score: <span className="font-bold text-purple-600">{scoreData.score}/{scoreData.totalPoints}</span>
                          </p>
                        ) : (
                          <p className="text-base md:text-lg text-gray-600">Late submissions will not be graded</p>
                        )}
                      </div>
                    )
                  }

                  if (isPast) {
                    return (
                      <div className="text-center py-6 md:py-8">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaTimes className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Deadline Passed</h2>
                        <p className="text-gray-600">This assignment deadline has passed</p>
                      </div>
                    )
                  }

                  return (
                    <>
                      <div className="mb-4 md:mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">{selectedAssignment.subject?.Name}</h2>
                        <p className="text-gray-600">Topic: {selectedAssignment.topic}</p>
                        <p className="text-sm text-gray-500">Teacher: {selectedAssignment.teacher?.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                          <span>Total Points: {selectedAssignment.totalPoints}</span>
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" /> Due: {formatDeadline(selectedAssignment.deadline).date}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        {selectedAssignment.questions?.map((question, qIndex) => (
                          <div key={qIndex} className="border rounded-lg p-3 md:p-4">
                            <div className="flex items-start gap-2 md:gap-3">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">
                                Q{qIndex + 1}
                              </span>
                              <span className="text-sm text-gray-500">({question.points} pts)</span>
                            </div>
                            <p className="mt-2 text-gray-900 font-medium">{question.question}</p>
                            <div className="mt-3">
                              <textarea
                                value={answers[qIndex] || ''}
                                onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                rows={3}
                                placeholder="Write your answer here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                                disabled={submission && submission.submittedAt}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 md:mt-6 flex justify-end">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || Object.keys(answers).length !== selectedAssignment.questions?.length}
                          className="flex items-center gap-2 bg-purple-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaSave />
                          )}
                          {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8 text-center text-gray-500">
                <FaBook className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                <p>Select an assignment from the list to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
