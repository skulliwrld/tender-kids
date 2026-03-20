import React from 'react'
import { fetchIndividualTeacherData } from '@/lib/actions/teacher.actions'
import TeacherForm from '@/components/shared-component/TeacherFieldForm'
import { TeacherUpdate } from '@/lib/actions/teacher.actions'
import { serializeMongoDoc } from '@/lib/utils/serialize'


async function TeacherEdit({params}) {
    const param = await params
    const {id} = param
    const teacher = await fetchIndividualTeacherData(id)

    if (!teacher) {
        return <div>Teacher not found</div>
    }

    const serializedTeacher = serializeMongoDoc(teacher)

  return (
    <TeacherForm type="edit" handleFuction={TeacherUpdate} content={serializedTeacher} />
  )
}

export default TeacherEdit