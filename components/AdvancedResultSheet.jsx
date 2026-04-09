'use client';

import React, { useState } from 'react';
import { FaStar, FaDownload, FaPrint, FaTrophy, FaMedal, FaFire, FaAward, FaChartBar } from 'react-icons/fa';

const AdvancedResultSheet = ({
  student,
  subjects,
  grades,
  term,
  session,
  className,
}) => {
  const [viewMode, setViewMode] = useState('table'); // table or cards

  // Calculate scores for each subject
  const calculateSubjectScores = (subjectId) => {
    const subjectGrades = grades.filter(g => {
      const gradeSubjectId = g.subject?._id || g.subject;
      const compareId = gradeSubjectId?.toString?.() || gradeSubjectId;
      const subId = subjectId?.toString?.() || subjectId;
      return compareId === subId && g.term === term && g.academicSession === session;
    });

    const testScore = subjectGrades.find(g => g.exam === 'Test')?.marks || 0;
    const assignmentScore = subjectGrades.find(g => g.exam === 'Assignment')?.marks || 0;
    const examScore = subjectGrades.find(g => g.exam === 'Exam')?.marks || 0;
    const total = testScore + assignmentScore + examScore;

    return {
      testScore,
      assignmentScore,
      examScore,
      total,
    };
  };

  // Get grade letter based on score
  const getGradeLetter = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  // Get color based on grade
  const getGradeColor = (score) => {
    if (score >= 90) return 'from-yellow-400 to-yellow-500';
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 70) return 'from-blue-400 to-blue-500';
    if (score >= 60) return 'from-indigo-400 to-indigo-500';
    if (score >= 50) return 'from-orange-400 to-orange-500';
    if (score >= 40) return 'from-red-400 to-red-500';
    return 'from-gray-400 to-gray-500';
  };

  const getGradeTextColor = (score) => {
    if (score >= 90) return 'text-yellow-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-indigo-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 40) return 'text-red-600';
    return 'text-gray-600';
  };

  // Calculate overall statistics
  const allScores = subjects.map(s => calculateSubjectScores(s._id));
  const overallTotal = allScores.reduce((sum, s) => sum + s.total, 0);
  const overallAverage = Math.round(overallTotal / subjects.length);
  const highestScore = Math.max(...allScores.map(s => s.total));
  const lowestScore = Math.min(...allScores.map(s => s.total));

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    alert('PDF download feature coming soon!');
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white/30 shadow-xl">
                  {student?.photo ? (
                    <img src={student.photo} alt={student?.Name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {student?.Name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {student?.Name}
                  </h1>
                  <p className="text-indigo-100 text-base sm:text-lg mb-3">Class: {className}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">
                      {term}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">
                      {session}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Score Card */}
              <div className="w-full lg:w-auto bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center shadow-xl">
                <p className="text-indigo-100 text-xs sm:text-sm mb-2 font-semibold">Overall Performance</p>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">{overallAverage}</div>
                <div className={`inline-block px-4 py-2 rounded-xl font-bold text-lg sm:text-xl text-white bg-gradient-to-r ${getGradeColor(overallAverage)}`}>
                  {getGradeLetter(overallAverage)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-indigo-200 text-sm sm:text-base font-semibold">Total Subjects</span>
              <FaAward className="text-lg sm:text-2xl text-indigo-200" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{subjects.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-purple-200 text-sm sm:text-base font-semibold">Average Score</span>
              <FaChartBar className="text-lg sm:text-2xl text-purple-200" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{overallAverage}%</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-pink-200 text-sm sm:text-base font-semibold">Highest Score</span>
              <FaTrophy className="text-lg sm:text-2xl text-pink-200" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{highestScore}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-200 text-sm sm:text-base font-semibold">Lowest Score</span>
              <FaMedal className="text-lg sm:text-2xl text-blue-200" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{lowestScore}</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6 lg:mb-8 flex-wrap gap-3">
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cards View
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-500 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg"
            >
              <FaPrint className="text-sm" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all shadow-md"
            >
              <FaDownload className="text-sm" /> Download
            </button>
          </div>
        </div>

        {/* Result Display */}
        {viewMode === 'table' ? (
          // Table View
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 lg:px-8 py-4 lg:py-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <FaStar className="text-yellow-300 text-lg sm:text-xl" />
                Detailed Result Sheet
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-indigo-300">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm lg:text-base font-bold text-slate-700">Subject</th>
                    <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm lg:text-base font-bold text-indigo-700 bg-indigo-50">Test (20)</th>
                    <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm lg:text-base font-bold text-purple-700 bg-purple-50">Assignment (10)</th>
                    <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm lg:text-base font-bold text-pink-700 bg-pink-50">Exam (70)</th>
                    <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm lg:text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600">Total (100)</th>
                    <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm lg:text-base font-bold text-slate-700">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjects.map((subject, index) => {
                    const scores = calculateSubjectScores(subject._id);
                    const gradeLetter = getGradeLetter(scores.total);
                    const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                    return (
                      <tr key={subject._id} className={`${rowBg} hover:bg-indigo-50 transition-colors`}>
                        <td className="px-4 sm:px-6 py-4 border-r border-slate-200">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm lg:text-base">{subject.Name}</div>
                          {subject.assignedTeacher && (
                            <p className="text-xs text-slate-500 hidden sm:block">{subject.assignedTeacher.name}</p>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-4 text-center bg-indigo-50/50 border-r border-slate-200">
                          <div className="inline-block px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg font-bold text-xs sm:text-sm">
                            {scores.testScore}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 text-center bg-purple-50/50 border-r border-slate-200">
                          <div className="inline-block px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg font-bold text-xs sm:text-sm">
                            {scores.assignmentScore}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 text-center bg-pink-50/50 border-r border-slate-200">
                          <div className="inline-block px-2 sm:px-3 py-1 bg-pink-100 text-pink-700 border border-pink-300 rounded-lg font-bold text-xs sm:text-sm">
                            {scores.examScore}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 text-center border-r border-slate-200">
                          <div className={`inline-block px-3 sm:px-4 py-2 rounded-xl font-bold text-white text-sm sm:text-base bg-gradient-to-r ${getGradeColor(scores.total)}`}>
                            {scores.total}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 text-center">
                          <div className={`inline-block px-3 sm:px-4 py-2 rounded-xl font-bold text-white text-xs sm:text-sm lg:text-base bg-gradient-to-r ${getGradeColor(scores.total)} border-2 ${getGradeColor(scores.total).split(' ')[3]}`}>
                            {gradeLetter}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Cards View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {subjects.map((subject) => {
              const scores = calculateSubjectScores(subject._id);
              const gradeLetter = getGradeLetter(scores.total);

              return (
                <div
                  key={subject._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${getGradeColor(scores.total)} px-6 py-4 text-white`}>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{subject.Name}</h3>
                    {subject.assignedTeacher && (
                      <p className="text-sm text-white/85">{subject.assignedTeacher.name}</p>
                    )}
                  </div>

                  {/* Scores */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                        <p className="text-indigo-600 text-xs font-semibold mb-2">Test</p>
                        <p className="text-2xl font-bold text-indigo-700">{scores.testScore}</p>
                        <p className="text-xs text-indigo-600">/ 20</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                        <p className="text-purple-600 text-xs font-semibold mb-2">Assignment</p>
                        <p className="text-2xl font-bold text-purple-700">{scores.assignmentScore}</p>
                        <p className="text-xs text-purple-600">/ 10</p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-3 text-center border border-pink-200">
                        <p className="text-pink-600 text-xs font-semibold mb-2">Exam</p>
                        <p className="text-2xl font-bold text-pink-700">{scores.examScore}</p>
                        <p className="text-xs text-pink-600">/ 70</p>
                      </div>
                    </div>

                    {/* Total and Grade */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-600 font-semibold">Total Score</span>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${getGradeColor(scores.total)} bg-clip-text text-transparent`}>
                          {scores.total}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Grade</span>
                        <div className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r ${getGradeColor(scores.total)}`}>
                          {gradeLetter}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedResultSheet;
