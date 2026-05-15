import { connectToDB } from '@/lib/Database/connectToDB'
import User from '@/models/user.model'
import { Parent } from '@/models/parent.model'
import { Student } from '@/models/student.model'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

const MAX_ADMIN_COUNT = 1

export async function POST(request) {
  try {
    const {
      name,
      email,
      password,
      role,
      classId,
      parentId,
      dob,
      gender,
      bio,
      address,
      phone,
      section,
      photo,
    } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    await connectToDB()

    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount >= MAX_ADMIN_COUNT) {
        return NextResponse.json({ message: 'Maximum admin accounts reached. Contact existing admin for access.' }, { status: 400 })
      }
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
      })

      await newUser.save({ session })

      if (role === 'parent') {
        const newParent = new Parent({
          Name: name,
          Email: email,
          Phone: null,
          Profession: '',
          Address: '',
          photo: ''
        })
        await newParent.save({ session })
      }

      if (role === 'student') {
        let parsedPhone = null
        if (phone !== null && phone !== undefined && String(phone).trim() !== '') {
          const numericPhone = Number(String(phone).trim())
          if (!Number.isNaN(numericPhone)) {
            parsedPhone = numericPhone
          }
        }

        const studentData = {
          Name: name,
          Email: email,
          Password: password,
          DOB: dob || '',
          Gender: gender || '',
          Bio: bio || '',
          Address: address || '',
          photo: photo || '',
          hasPaid: false,
        }

        if (parsedPhone !== null) {
          studentData.Phone = parsedPhone
        }

        if (classId) {
          studentData.Class = new mongoose.Types.ObjectId(classId)
        }

        if (parentId) {
          studentData.Parent = new mongoose.Types.ObjectId(parentId)
        }

        if (section) {
          studentData.section = new mongoose.Types.ObjectId(section)
        }

        const newStudent = new Student(studentData)
        await newStudent.save({ session })
      }

      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
