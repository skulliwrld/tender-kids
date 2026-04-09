'use client'

import { useState } from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function StudentPhotoDialog({ student, imageSize = 'w-32 h-32', borderSize = 'border-4' }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);

  const handlePhotoClick = () => {
    setSelectedStudent(student);
    setOpenPhotoDialog(true);
  };

  return (
    <>
      <div 
        onClick={handlePhotoClick}
        className={`relative ${imageSize} rounded-full overflow-hidden ${borderSize} border-white shadow-lg bg-white cursor-pointer hover:shadow-xl hover:border-indigo-400 transition-all duration-200`}
      >
        {student?.photo ? (
          <Image 
            src={student.photo} 
            alt={student.Name || student.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-4xl">
            {(student?.Name || student?.name)?.charAt(0)?.toUpperCase() || 'S'}
          </div>
        )}
      </div>

      {/* Photo Dialog */}
      <Dialog open={openPhotoDialog} onOpenChange={setOpenPhotoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {selectedStudent?.Name || selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedStudent?.photo ? (
              <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-xl border-8 border-indigo-100">
                <Image 
                  src={selectedStudent.photo} 
                  alt={selectedStudent.Name || selectedStudent.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-9xl font-bold rounded-xl shadow-xl">
                {(selectedStudent?.Name || selectedStudent?.name)?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
