import { connectToDB } from '@/lib/Database/connectToDB'
import User from '@/models/user.model'
import { Parent } from '@/models/parent.model'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

const MAX_ADMIN_COUNT = 1

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json()

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

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    })

    await newUser.save()

    if (role === 'parent') {
      const newParent = new Parent({
        Name: name,
        Email: email,
        Phone: null,
        Profession: '',
        Address: '',
        photo: ''
      })
      await newParent.save()
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}